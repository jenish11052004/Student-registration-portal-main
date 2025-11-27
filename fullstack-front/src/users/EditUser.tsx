import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import img_1 from '../assests/images/student.png';
import Navbar from '../layout/Navbar';
import './AddUser.css';

import { Student, Domain } from '../types';

const initialStudent: Student = {
  firstName: '',
  lastName: '',
  email: '',
  cgpa: '',
  totalCredits: '',
  graduationYear: '',
  domainId: '',
  specialisationId: '',
  placementId: '',
  rollNumber: '',
};

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student>(initialStudent);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [photograph, setPhotograph] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');

  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from({ length: currentYear - 1999 }, (_, i) => 2000 + i).reverse();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [domainsRes, studentRes] = await Promise.all([
          axios.get('http://localhost:8080/api/domains'),
          axios.get(`http://localhost:8080/api/students/${id}`),
        ]);
        setDomains(domainsRes.data as Domain[]);
        const data = studentRes.data as Student;
        setStudent({
          firstName: data.firstName ?? '',
          lastName: data.lastName ?? '',
          email: data.email ?? '',
          cgpa: data.cgpa !== null && data.cgpa !== undefined ? data.cgpa.toString() : '',
          totalCredits: data.totalCredits !== null && data.totalCredits !== undefined ? data.totalCredits.toString() : '',
          graduationYear: data.graduationYear ? String(data.graduationYear) : '',
          domainId: data.domainId ? String(data.domainId) : '',
          specialisationId: data.specialisationId ? String(data.specialisationId) : '',
          placementId: data.placementId ? String(data.placementId) : '',
          rollNumber: data.rollNumber ?? '',
        });
      } catch (error) {
        console.error('Unable to load student details', error);
        alert('Unable to load student details.');
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const numericFields = new Set(['cgpa', 'totalCredits', 'domainId', 'specialisationId', 'placementId']);

  const clampValue = (name: string, value: string) => {
    if (value === '') {
      return '';
    }
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
      return '';
    }
    if (['specialisationId', 'placementId', 'domainId'].includes(name)) {
      return Math.max(1, numericValue);
    }
    if (name === 'totalCredits') {
      return Math.max(0, numericValue);
    }
    if (name === 'cgpa') {
      return Math.max(0, Math.min(10, numericValue));
    }
    return numericValue;
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const normalized = numericFields.has(name) ? clampValue(name, value) : value;

    if (name === 'email') {
      setEmailError('');
    }

    setStudent((prev) => ({
      ...prev,
      [name]:
        name === 'domainId' && normalized !== ''
          ? String(normalized)
          : normalized,
    }));
  };

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotograph(e.target.files?.[0] ?? null);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!student.firstName.trim() || !student.lastName.trim() || !student.email.trim()) {
      alert('Name and email are required.');
      return;
    }
    // Domain is read-only in edit mode, so we don't need to validate it
    if (!student.graduationYear) {
      alert('Please select a graduation year.');
      return;
    }

    const payload = new FormData();
    const studentData = {
      firstName: student.firstName.trim(),
      lastName: student.lastName.trim(),
      email: student.email.trim(),
      cgpa: Number(student.cgpa),
      domainId: Number(student.domainId), // Required by backend even though it's read-only in UI
      totalCredits: Number(student.totalCredits),
      graduationYear: Number(student.graduationYear),
      specialisationId: student.specialisationId ? Number(student.specialisationId) : null,
      placementId: student.placementId ? Number(student.placementId) : null,
    };

    payload.append('student', JSON.stringify(studentData));
    if (photograph) {
      payload.append('photograph', photograph, photograph.name);
    }

    try {
      setSubmitting(true);
      await axios.put(`http://localhost:8080/api/students/${id}`, payload);
      navigate('/home');
    } catch (error: any) {
      console.error('Failed to update student', error);
      if (error.response?.data?.message === 'Email already registered') {
        setEmailError('Email already registered');
      } else {
        alert('Unable to update student. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <div className="alert alert-info text-center">Loading student details...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card-modern p-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-secondary">Edit Student</h2>
                <p className="text-muted">Update student details below</p>
                {id && (
                  <div className="mt-3">
                    <img
                      src={`http://localhost:8080/api/students/${id}/photo`}
                      alt="Current"
                      className="rounded-circle shadow-sm"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <form onSubmit={onSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="firstName" className="form-label fw-bold small text-secondary">First Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control form-control-modern"
                      placeholder="Enter first name"
                      name="firstName"
                      value={student.firstName}
                      onChange={onInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lastName" className="form-label fw-bold small text-secondary">Last Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control form-control-modern"
                      placeholder="Enter last name"
                      name="lastName"
                      value={student.lastName}
                      onChange={onInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-bold small text-secondary">Email <span className="text-danger">*</span></label>
                  <input
                    type="email"
                    className={`form-control form-control-modern ${emailError ? 'is-invalid' : ''}`}
                    placeholder="name@example.com"
                    name="email"
                    value={student.email}
                    onChange={onInputChange}
                    required
                  />
                  {emailError && <div className="invalid-feedback">{emailError}</div>}
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="cgpa" className="form-label fw-bold small text-secondary">CGPA <span className="text-danger">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      className="form-control form-control-modern"
                      placeholder="e.g. 8.5"
                      name="cgpa"
                      value={student.cgpa}
                      onChange={onInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="totalCredits" className="form-label fw-bold small text-secondary">Total Credits <span className="text-danger">*</span></label>
                    <input
                      type="number"
                      className="form-control form-control-modern"
                      placeholder="e.g. 80"
                      name="totalCredits"
                      value={student.totalCredits}
                      onChange={onInputChange}
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="domainId" className="form-label fw-bold small text-secondary">Domain / Program</label>
                  <select
                    className="form-select form-control-modern"
                    name="domainId"
                    value={student.domainId}
                    onChange={onInputChange}
                    disabled
                    style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                  >
                    <option value="">Select Domain</option>
                    {domains.map((domain) => (
                      <option key={domain.id} value={domain.id}>
                        {domain.program}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="graduationYear" className="form-label fw-bold small text-secondary">Graduation Year <span className="text-danger">*</span></label>
                  <select
                    className="form-select form-control-modern"
                    name="graduationYear"
                    value={student.graduationYear}
                    onChange={onInputChange}
                    required
                  >
                    <option value="">Select Graduation Year</option>
                    {graduationYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="specialisationId" className="form-label fw-bold small text-secondary">Specialisation ID (optional)</label>
                    <input
                      type="number"
                      className="form-control form-control-modern"
                      name="specialisationId"
                      min="1"
                      value={student.specialisationId ?? ''}
                      onChange={onInputChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="placementId" className="form-label fw-bold small text-secondary">Placement ID (optional)</label>
                    <input
                      type="number"
                      className="form-control form-control-modern"
                      name="placementId"
                      min="1"
                      value={student.placementId ?? ''}
                      onChange={onInputChange}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="photograph" className="form-label fw-bold small text-secondary">Update Photograph</label>
                  <input
                    type="file"
                    className="form-control form-control-modern"
                    name="photograph"
                    accept="image/*"
                    onChange={onPhotoChange}
                  />
                  <small className="text-muted">Leave blank to keep the current photo.</small>
                </div>
                <div className="d-grid gap-2">
                  <button type="submit" className="btn-gradient" disabled={submitting}>
                    {submitting ? 'Updating...' : 'Update Student'}
                  </button>
                  <Link className="btn btn-light text-secondary fw-bold" to="/home">
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}