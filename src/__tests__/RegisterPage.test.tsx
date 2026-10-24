/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RegisterPage } from '../pages/RegisterPage';

describe('RegisterPage Component', () => {
  it('renders registration form inputs and submit button', () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText(/nama lengkap/i);
    const emailInput = screen.getByLabelText(/alamat email/i);
    const passwordInput = screen.getByLabelText(/kata sandi/i);
    const submitButton = screen.getByRole('button', { name: /daftar akun baru/i });

    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });
});
