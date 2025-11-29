import React, { useEffect, useState } from 'react'
import '../css/Leaderboard.css'
import supabase from '../supabaseClient'

const Leaderboard = () => {
  const getSemesterFromDate = (dateStr) => {
    const date = new Date(dateStr)
    const month = date.getMonth()
    const year = date.getFullYear()
    
    if (month >= 0 && month <= 4) return `Spring ${year}`
    if (month >= 5 && month <= 7) return `Summer ${year}`
    return `Fall ${year}`
  }

  const [selectedSemester, setSelectedSemester] = useState('Fall 2025')
  const [semesters, setSemesters] = useState(['Fall 2025'])
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const { data, error: dbError } = await supabase
          .from('uploads')
          .select('uploaded_at')
        
        if (dbError) throw dbError
        
        // Extract semesters from upload dates
        const semestersFromDates = data.map(u => getSemesterFromDate(u.uploaded_at))
        const uniqueSemesters = [...new Set(semestersFromDates)]
        setSemesters(uniqueSemesters.sort().reverse())
      } catch (err) {
        console.error('Error fetching semesters:', err)
      }
    }
    
    fetchSemesters()
  }, [])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      try {
        // Query all uploads
        const { data, error: dbError } = await supabase
          .from('uploads')
          .select('uploader_name, uploader_email, uploaded_at')

        if (dbError) throw dbError

        // Filter by semester based on uploaded_at date
        const filteredData = data.filter(upload => {
          const uploadSemester = getSemesterFromDate(upload.uploaded_at)
          return uploadSemester === selectedSemester
        })

        // Group by uploader and count
        const counts = {}
        filteredData.forEach(upload => {
          const key = `${upload.uploader_name}::${upload.uploader_email}`
          counts[key] = (counts[key] || 0) + 1
        })

        // Convert to array and sort
        const leaderboard = Object.entries(counts)
          .map(([key, count]) => {
            const [name, email] = key.split('::')
            return { name, email, count }
          })
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        setLeaders(leaderboard)
      } catch (err) {
        console.error('Leaderboard error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [selectedSemester])

  return (
    <div className='leaderboard-page'>
      <div className='leaderboard-container'>
        <h2>Top Contributors</h2>
        <p className='subtitle'>Students who have uploaded the most exams per semester</p>
        
        <div className='semester-selector'>
          <label>Select Semester:
            <select 
              value={selectedSemester} 
              onChange={(e) => setSelectedSemester(e.target.value)}
              className='semester-dropdown'
            >
              {semesters.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </label>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p style={{color: 'red'}}>{error}</p>}
        {!loading && !error && leaders.length === 0 && <p>No uploads for this semester yet!</p>}
        {!loading && !error && leaders.length > 0 && (
          <table className='leaderboard-table'>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Email</th>
                <th>Uploads</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((leader, index) => (
                <tr key={leader.email}>
                  <td>{index + 1}</td>
                  <td>{leader.name}</td>
                  <td>{leader.email}</td>
                  <td>{leader.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Leaderboard