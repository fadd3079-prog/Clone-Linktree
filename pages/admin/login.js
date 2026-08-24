import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import styled from "styled-components";
import Head from "next/head";

export default function AdminLogin() {
    const { status } = useSession();
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/admin");
        }
    }, [status, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        if (!username.trim() || !password) {
            setErrorMsg("Silakan masukkan username/email dan password.");
            return;
        }

        setLoading(true);
        try {
            const res = await signIn("credentials", {
                redirect: false,
                username: username.trim(),
                password: password
            });

            if (res?.error) {
                setErrorMsg(res.error || "Username atau password salah.");
            } else if (res?.ok) {
                router.push("/admin");
            }
        } catch (err) {
            console.error("Login error:", err);
            setErrorMsg("Terjadi kesalahan sistem. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <CenterContainer>
                <Spinner />
            </CenterContainer>
        );
    }

    return (
        <>
            <Head>
                <title>Admin Login • Fadd Links</title>
            </Head>
            <LoginWrapper>
                <LoginCard>
                    <BrandHeader>
                        <AvatarImg src="/avatar.png" alt="Fadd Graphics" />
                        <BrandTitle>Fadd Admin Portal</BrandTitle>
                        <BrandSubtitle>Masuk untuk mengelola tautan dan melihat analitik</BrandSubtitle>
                    </BrandHeader>

                    {errorMsg && (
                        <ErrorAlert>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <span>{errorMsg}</span>
                        </ErrorAlert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label>Username / Email</Label>
                            <Input
                                type="text"
                                placeholder="fadd3079@gmail.com"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Password</Label>
                            <Input
                                type="password"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </FormGroup>

                        <SubmitBtn type="submit" disabled={loading}>
                            {loading ? (
                                <BtnLoadingWrap>
                                    <MiniSpinner />
                                    <span>Memverifikasi...</span>
                                </BtnLoadingWrap>
                            ) : (
                                "Masuk ke Dashboard"
                            )}
                        </SubmitBtn>
                    </Form>

                    <FooterNote>
                        <a href="/" target="_blank" rel="noreferrer">
                            ← Kembali ke Halaman Utama
                        </a>
                    </FooterNote>
                </LoginCard>
            </LoginWrapper>
        </>
    );
}

const CenterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const MiniSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const BtnLoadingWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const LoginWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
`;

const LoginCard = styled.div`
  width: 100%;
  max-width: 420px;
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  border-radius: 20px;
  padding: 36px 28px;
  box-shadow: ${({ theme }) => theme.bg.cardShadow};
  transition: all 0.2s ease;

  @media screen and (max-width: 480px) {
    padding: 28px 20px;
    border-radius: 16px;
  }
`;

const BrandHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 24px;
`;

const AvatarImg = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  object-fit: cover;
  margin-bottom: 12px;
  border: 2px solid ${({ theme }) => theme.bg.cardBorder};
`;

const BrandTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.4px;
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: 4px;
`;

const BrandSubtitle = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.text.secondary};
  line-height: 18px;
`;

const ErrorAlert = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 20px;

  svg {
    flex-shrink: 0;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.1px;
  color: ${({ theme }) => theme.text.primary};
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 14px;
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  background: ${({ theme }) => theme.bg.primary};
  color: ${({ theme }) => theme.text.primary};
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
  }

  &::placeholder {
    color: ${({ theme }) => theme.text.placeholder};
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  margin-top: 8px;
  padding: 13px 16px;
  border-radius: 10px;
  font-size: 14.5px;
  font-weight: 600;
  letter-spacing: -0.2px;
  background: #2563eb;
  color: #ffffff;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;

  &:hover:not(:disabled) {
    background: #1d4ed8;
  }

  &:active:not(:disabled) {
    transform: scale(0.99);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const FooterNote = styled.div`
  margin-top: 24px;
  text-align: center;

  a {
    font-size: 13px;
    font-weight: 500;
    color: ${({ theme }) => theme.text.secondary};
    transition: color 0.15s ease;

    &:hover {
      color: ${({ theme }) => theme.text.primary};
    }
  }
`;
