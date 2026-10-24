/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';

describe('LoginPage Component', () => {
  it('renders required grading selectors (#username, #password, #btn-submit)', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const usernameInput = screen.getByRole('textbox', { name: /alamat email \/ username/i });
    const passwordInput = screen.getByLabelText(/kata sandi/i);
    const submitButton = screen.getByRole('button', { name: /masuk \(login\)/i });

    expect(usernameInput).toBeInTheDocument();
    expect(usernameInput).toHaveAttribute('id', 'username');

    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('id', 'password');

    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('id', 'btn-submit');
  });
});
