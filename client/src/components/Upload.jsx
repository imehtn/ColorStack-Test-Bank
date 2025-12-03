import React, { useState } from 'react'
import '../css/Upload.css'
import supabase from '../supabaseClient'

const Upload = () => {
  const [form, setForm] = useState({ course: '', semester: '', email: '', name: '', exam_type: '', comments: '' })
  const [customCourse, setCustomCourse] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  const handleFile = e => setFile(e.target.files[0])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    setError(null)

    try {
      const courseValue = form.course === 'Other' ? customCourse : form.course
      
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${courseValue}/${form.semester}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('exam-files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('exam-files')
        .getPublicUrl(filePath)

      // Insert metadata into database
      const { error: dbError } = await supabase
        .from('uploads')
        .insert({
          course: courseValue,
          semester: form.semester,
          exam_type: form.exam_type,
          uploader_name: form.name,
          uploader_email: form.email,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          comments: form.comments || null
        })

      if (dbError) throw dbError

      setShowSuccess(true)
      setForm({ course: '', semester: '', email: '', name: '', exam_type: '', comments: '' })
      setCustomCourse('')
      setFile(null)
      e.target.reset()
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className='upload-page'>
      <div className='upload-container'>
        <h2>Upload an Exam</h2>
        {error && <p style={{color: 'red'}}>{error}</p>}
        <form className='upload-form' onSubmit={handleSubmit}>
          <label>Your Name
            <input name='name' type='text' value={form.name} onChange={handleChange} placeholder='Brutus Buckeye' required />
          </label>
          <label>Course
            <select name='course' value={form.course} onChange={handleChange} required>
              <option value='' disabled>Choose a course</option>
              <option>CSE 1223</option>
              <option>CSE 2221</option>
              <option>CSE 2231</option>
              <option>CSE 2321</option>
              <option>CSE 2331</option>
              <option>CSE 2421</option>
              <option>ECE 2060</option>
              <option>ECE 2360</option>
              <option>MATH 1151</option>
              <option>MATH 1152</option>
              <option>MATH 2153</option>
              <option>MATH 1172</option>
              <option>PHYSICS 1250</option>
              <option>STATS 3470</option>
              <option value='Other'>Other (specify)</option>
            </select>
          </label>
          {form.course === 'Other' && (
            <label>Specify Course
              <input type='text' name='customCourse' value={customCourse} onChange={e => setCustomCourse(e.target.value)} placeholder='e.g., BIO 1110' required />
            </label>
          )}
          <label>Semester
            <select name='semester' value={form.semester} onChange={handleChange} required>
              <option value='' disabled>Choose a semester</option>
              <option>Fall 2025</option>
              <option>Spring 2025</option>
              <option>Summer 2025</option>
              <option>Fall 2024</option>
              <option>Spring 2024</option>
              <option>Summer 2024</option>
              <option value='Other'>Other (specify)</option>
            </select>
          </label>
          {form.semester === 'Other' && (
            <label>Specify course
              <input name='customCourse' value={customCourse} onChange={e => setCustomCourse(e.target.value)} placeholder='e.g., Fall 2020' required />
            </label>
          )}
          <label>Exam Type
            <select name='exam_type' value={form.exam_type} onChange={handleChange} required>
              <option value='' disabled>Choose exam type</option>
              <option>Midterm</option>
              <option>Final</option>
            </select>
          </label>
          <label>Your Email
            <input name='email' type='email' value={form.email} onChange={handleChange} placeholder='name.#@osu.edu' required />
          </label>
          <label>File
            <input name='file' type='file' accept='.pdf,.png,.jpg' onChange={handleFile} required />
          </label>
          <label>Additional Comments (Optional)
            <textarea 
              name='comments' 
              value={form.comments} 
              onChange={handleChange} 
              placeholder='Any additional notes about this exam (e.g. midterm #, professor, curved/not curved, etc)'
              rows='3'
            />
          </label>
          <div className='form-actions'>
            <button className='btn primary' type='submit' disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>

      {showSuccess && (
        <div className='success-modal-overlay' onClick={() => setShowSuccess(false)}>
          <div className='success-modal' onClick={(e) => e.stopPropagation()}>
            <div className='success-icon'>✓</div>
            <h3>Upload Successful!</h3>
            <p>ColorStack OSU thanks you for contributing to our test bank. Your exam will help fellow students prepare and succeed.</p>
            <button className='btn primary' onClick={() => setShowSuccess(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Upload