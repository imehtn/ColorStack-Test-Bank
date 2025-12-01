import React from 'react'
import { Link } from 'react-router-dom'
import '../css/Home.css'
import supabase from "../supabaseClient"
import {useEffect, useState} from 'react'

const Home = () => {  
  const [fetchError, setFetchError] = useState(null)
  const [allExams, setExams] = useState([])
  const [filteredExams, setFilteredExams] = useState([])
  const [searchCourse, setSearchCourse] = useState('')
  const [searchSemester, setSearchSemester] = useState('')

  useEffect(()=>{
    const fetchExams = async () =>{
      const { data, error} = await supabase 
      .from('uploads')
      .select('*')
      .order('uploaded_at', { ascending: false })

      if (error){
        setFetchError('Could not fetch the exams')
        setExams([])
        console.log(error)
      }

      if (data){
        setExams(data)
        setFilteredExams(data)
        setFetchError(null)
      }
    }
    fetchExams()
  },[])

  useEffect(() => {
    let filtered = allExams
    if (searchCourse) {
      filtered = filtered.filter(exam => 
        exam.course.toLowerCase().includes(searchCourse.toLowerCase())
      )
    }
    if (searchSemester) {
      filtered = filtered.filter(exam => 
        exam.semester.toLowerCase().includes(searchSemester.toLowerCase())
      )
    }
    setFilteredExams(filtered)
  }, [searchCourse, searchSemester, allExams])

  return (
    <div className='home-page'>
      <div className='home-hero'>
        <div className='home-container'>
          <h1 className='home-title'>ColorStack Test Bank</h1>
          <p className='home-sub'>A student-run archive of past midterms and finals for practice.</p>
          <div className='home-actions'>
            <Link to='/upload' className='home-btn primary'>Upload an exam</Link>
          </div>
        </div>
      </div>

      <div className='exams-section'>
        <div className='exams-container'>
          <h2>Available Exams</h2>
          {fetchError && <p style={{color: 'red'}}>{fetchError}</p>}
          
          <div className='search-filters'>
            <input 
              type='text' 
              placeholder='Search by course (e.g., CSE 2221)' 
              value={searchCourse}
              onChange={(e) => setSearchCourse(e.target.value)}
              className='search-input'
            />
            <input 
              type='text' 
              placeholder='Search by semester (e.g., Fall 2025)' 
              value={searchSemester}
              onChange={(e) => setSearchSemester(e.target.value)}
              className='search-input'
            />
          </div>

          {filteredExams.length === 0 && !fetchError && (
            <p className='no-exams'>No exams found. Be the first to upload!</p>
          )}

          {filteredExams.length > 0 && (
            <div className='exams-grid'>
              {filteredExams.map(exam => (
                <div key={exam.id} className='exam-card'>
                  <h3 className='exam-course'>{exam.course}</h3>
                  <p className='exam-info'>{exam.semester}</p>
                  <p className='exam-info'>{exam.exam_type || 'Exam'}</p>
                  {exam.comments && (
                    <p className='exam-info'>Additional information from uploader: {exam.comments}</p>
                  )}
                  <a 
                    href={exam.file_url} 
                    target='_blank' 
                    rel='noopener noreferrer' 
                    className='download-btn'
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home