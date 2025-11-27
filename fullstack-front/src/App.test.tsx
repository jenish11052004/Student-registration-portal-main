import { render, screen } from '@testing-library/react';
import axios from 'axios';
import App from './App';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

test('renders admin login', () => {
  render(<App />);
  const linkElement = screen.getByText(/admin login/i);
  expect(linkElement).toBeInTheDocument();
});
