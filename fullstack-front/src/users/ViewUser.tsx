import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../layout/Navbar';

import { Student } from '../types';

export default function ViewUser() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();

  useEffect(() => {
    const loadStudent = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get<Student>(`http://localhost:8080/api/students/${id}`, { withCredentials: true });
        setStudent(data);
        setError(null);
      } catch (err) {
        console.error('Unable to fetch student', err);
        setError('Unable to fetch student details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [id]);

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card-modern p-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-secondary">Student Details</h2>
                <p className="text-muted">View student information</p>
              </div>

              {loading && <div className="alert alert-info text-center">Loading student details...</div>}
              {error && <div className="alert alert-danger text-center">{error}</div>}

              {!loading && !error && student && (
                <>
                  <div className="d-flex flex-column align-items-center mb-4">
                    {student.photographPath ? (
                      <img
                        src={`http://localhost:8080/api/students/${student.id}/photo`}
                        alt={`Photograph of ${student.firstName}`}
                        className="rounded-circle shadow-lg mb-3"
                        style={{ width: '150px', height: '150px', objectFit: 'cover', border: '4px solid white' }}
                      />
                    ) : (
                      <div className="bg-light rounded-circle d-flex align-items-center justify-content-center text-muted mb-3 shadow-sm" style={{ width: '150px', height: '150px', border: '4px solid white' }}>
                        <i className="bi bi-person fs-1"></i>
                      </div>
                    )}
                    <h3 className="fw-bold mb-0">{student.firstName} {student.lastName}</h3>
                    <span className="badge bg-light text-dark border mt-2">
                      {student.rollNumber || 'No Roll Number'}
                    </span>
                  </div>

                  <div className="card bg-light border-0 rounded-3 p-3 mb-4">
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>Email</small>
                        <span className="fw-medium">{student.email}</span>
                      </div>
                      <div className="col-sm-6">
                        <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>CGPA</small>
                        <span className="fw-medium">{student.cgpa ?? 'N/A'}</span>
                      </div>
                      <div className="col-sm-6">
                        <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>Total Credits</small>
                        <span className="fw-medium">{student.totalCredits ?? 'N/A'}</span>
                      </div>
                      <div className="col-sm-6">
                        <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>Graduation Year</small>
                        <span className="fw-medium">{student.graduationYear ?? 'N/A'}</span>
                      </div>
                      <div className="col-12">
                        <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>Domain / Program</small>
                        <span className="fw-medium">{student.domainProgram || 'N/A'}</span>
                      </div>
                      <div className="col-sm-6">
                        <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>Specialisation ID</small>
                        <span className="fw-medium">
                          {(student.specialisationId !== null && student.specialisationId !== undefined) ? student.specialisationId : 'Not Assigned'}
                        </span>
                      </div>
                      <div className="col-sm-6">
                        <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>Placement ID</small>
                        <span className="fw-medium">
                          {(student.placementId !== null && student.placementId !== undefined) ? student.placementId : 'Not Assigned'}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="d-grid">
                <Link className="btn btn-gradient" to="/home">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}