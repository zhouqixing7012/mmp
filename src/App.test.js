import { render, screen } from '@testing-library/react';
import App from './App';

test('renders asset management system', () => {
  render(<App />);
  const navElement = screen.getByText('报废申请单');
  expect(navElement).toBeInTheDocument();
});
