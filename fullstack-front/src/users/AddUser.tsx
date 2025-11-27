import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import img_1 from '../assests/images/student.png';
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
};

export default function AddUser() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student>(initialStudent);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [photograph, setPhotograph] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Generate years from 2000 to current year
  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from({ length: currentYear - 1999 }, (_, i) => 2000 + i).reverse();

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        console.log('Fetching domains from http://localhost:8080/api/domains');
        const { data } = await axios.get<Domain[]>('http://localhost:8080/api/domains');
        console.log('Domains fetched successfully:', data);
        setDomains(data);
      } catch (error: any) {
        console.error('Unable to load domains', error);
        console.error('Error details:', error.response?.data || error.message);
        alert('Unable to load domains. Please check:\n1. Backend is running on port 8080\n2. Check browser console for details');
        setDomains([]);
      }
    };

    fetchDomains();
  }, []);

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
    if (name === 'graduationYear') {
      return Math.max(2000, numericValue);
    }
    return numericValue;
  };

  const numericFields = new Set([
    'cgpa',
    'totalCredits',
    'domainId',
    'specialisationId',
    'placementId',
  ]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const normalized = numericFields.has(name) ? clampValue(name, value) : value;

    if (name === 'email') {
      setEmailError('');
    }

    setStudent((prev) => ({
      ...prev,
      [name]: name === 'domainId' && normalized !== '' ? String(normalized) : normalized,
    }));
  };

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotograph(e.target.files?.[0] ?? null);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate required fields
    if (!student.firstName || student.firstName.trim() === '') {
      alert('First name is required');
      return;
    }
    if (!student.lastName || student.lastName.trim() === '') {
      alert('Last name is required');
      return;
    }
    if (!student.email || student.email.trim() === '') {
      alert('Email is required');
      return;
    }
    if (!student.cgpa || student.cgpa === '') {
      alert('CGPA is required');
      return;
    }
    if (!student.totalCredits || student.totalCredits === '') {
      alert('Total credits is required');
      return;
    }
    if (!student.graduationYear || student.graduationYear === '') {
      alert('Graduation year is required');
      return;
    }
    const currentYear = new Date().getFullYear();
    const graduationYear = Number(student.graduationYear);
    if (graduationYear < 2000 || graduationYear > currentYear) {
      alert(`Graduation year must be between 2000 and ${currentYear}`);
      return;
    }
    if (!student.domainId) {
      alert('Please select a domain');
      return;
    }
    if (!photograph) {
      alert('Photograph is required. Please upload a photo.');
      return;
    }

    const payload = new FormData();
    const studentData = {
      firstName: student.firstName.trim(),
      lastName: student.lastName.trim(),
      email: student.email.trim(),
      cgpa: Number(student.cgpa),
      domainId: Number(student.domainId),
      totalCredits: Number(student.totalCredits),
      graduationYear: Number(student.graduationYear),
      specialisationId: student.specialisationId ? Number(student.specialisationId) : null,
      placementId: student.placementId ? Number(student.placementId) : null,
    };

    const studentJson = JSON.stringify(studentData);
    console.log('Sending student JSON:', studentJson); // Debug log

    payload.append('student', studentJson);
    payload.append('photograph', photograph, photograph.name);

    try {
      setSubmitting(true);
      await axios.post('http://localhost:8080/api/students', payload);
      navigate('/home');
    } catch (error: any) {
      console.error('Failed to register student', error);
      if (error.response?.data?.message === 'Email already registered') {
        setEmailError('Email already registered');
      } else {
        alert('Unable to register student. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (

    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card-modern p-4">
            <div className="text-center mb-4">
              <h2 className="fw-bold text-secondary">Register Student</h2>
              <p className="text-muted">Enter student details below</p>
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
                <label htmlFor="domainId" className="form-label fw-bold small text-secondary">Domain / Program <span className="text-danger">*</span></label>
                <select
                  className="form-select form-control-modern"
                  name="domainId"
                  value={student.domainId}
                  onChange={onInputChange}
                  required
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
                <label htmlFor="photograph" className="form-label fw-bold small text-secondary">Photograph <span className="text-danger">*</span></label>
                <input
                  type="file"
                  className="form-control form-control-modern"
                  name="photograph"
                  accept="image/*"
                  onChange={onPhotoChange}
                  required
                />
              </div>
              <div className="d-grid gap-2">
                <button type="submit" className="btn-gradient" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Register Student'}
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
  );
}