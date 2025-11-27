import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Home.css';
import Navbar from '../layout/Navbar';

import { Student } from '../types';

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<Student[]>('http://localhost:8080/api/students');
      setStudents(data);
      setError(null);
    } catch (err) {
      console.error('Unable to fetch students', err);
      setError('Unable to fetch students right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentId: number | undefined) => {
    if (!studentId) return;
    const confirmDelete = window.confirm('Are you sure you want to delete this student?');
    if (!confirmDelete) {
      return;
    }
    try {
      await axios.delete(`http://localhost:8080/api/students/${studentId}`);
      setStudents((prev) => prev.filter((student) => student.id !== studentId));
    } catch (err) {
      console.error('Unable to delete student', err);
      alert('Unable to delete student. Please try again.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-secondary">Registered Students</h2>
          <Link className="btn-gradient text-decoration-none shadow-sm" to="/adduser">
            + Add Student
          </Link>
        </div>
        {loading && <div className="alert alert-info shadow-sm rounded-3">Loading students...</div>}
        {error && <div className="alert alert-danger shadow-sm rounded-3">{error}</div>}

        {!loading && !error && (
          <div className="card-modern p-0 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-modern mb-0">
                <thead>
                  <tr>
                    <th scope="col" className="ps-4">#</th>
                    <th scope="col">Roll Number</th>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Program</th>
                    <th scope="col">Photograph</th>
                    <th scope="col" className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-5">
                        <div className="d-flex flex-column align-items-center">
                          <i className="bi bi-people fs-1 mb-2 text-secondary opacity-50"></i>
                          <p className="mb-0">No students registered yet.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {students.map((student, index) => (
                    <tr key={student.id ?? index}>
                      <th scope="row" className="ps-4 align-middle">{index + 1}</th>
                      <td className="align-middle">{student.rollNumber ?? '-'}</td>
                      <td className="align-middle fw-medium">{[student.firstName, student.lastName].filter(Boolean).join(' ') || '-'}</td>
                      <td className="align-middle text-muted">{student.email}</td>
                      <td className="align-middle">
                        {student.domainProgram ? (
                          <span className="badge bg-light text-dark border">
                            {student.domainProgram} <span className="text-muted">({new Date().getFullYear()})</span>
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="photo-cell align-middle">
                        {student.photographPath ? (
                          <img
                            src={`http://localhost:8080/api/students/${student.id}/photo`}
                            alt={`Photograph of ${student.firstName ?? 'student'}`}
                            className="student-photo shadow-sm rounded-circle"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="bg-light rounded-circle d-flex align-items-center justify-content-center text-muted" style={{ width: '40px', height: '40px' }}>
                            <i className="bi bi-person"></i>
                          </div>
                        )}
                      </td>
                      <td className="align-middle text-end pe-4">
                        <div className="d-flex justify-content-end gap-2">
                          <Link className="btn btn-sm btn-outline-primary rounded-pill px-3" to={`/viewuser/${student.id}`}>
                            View
                          </Link>
                          <Link className="btn btn-sm btn-outline-secondary rounded-pill px-3" to={`/edituser/${student.id}`}>
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger rounded-pill px-3"
                            onClick={() => handleDelete(student.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
