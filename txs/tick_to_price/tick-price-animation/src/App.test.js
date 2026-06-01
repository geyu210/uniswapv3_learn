import { render, screen } from '@testing-library/react';
import App from './App';

test('renders tick price animation heading', () => {
  render(<App />);
  const heading = screen.getByText(/Price、Tick 与 √Price 的关系曲线/i);
  expect(heading).toBeInTheDocument();
});
