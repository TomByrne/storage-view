import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders App component', () => {
  const app = render(<App />);
  expect(app.baseElement).toBeInTheDocument();
});
