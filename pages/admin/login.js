import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import styled from "styled-components";
import ThemeToggle from "../../components/ThemeToggle";

export default function AdminLogin() {
    const { status } = useSession();
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [showPw, setShowPw] = useState(false);

    useEffect(() => {
        if (status === "authenticated") router.replace("/admin");
    }, [status, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        if (!username.trim() || !password) {
            setErrorMsg("Masukkan email dan password.");
            return;
        }

        setLoading(true);
        try {
            const res = await signIn("credentials", {
                redirect: false,
                username: username.trim(),
                password
            });
            if (res?.error) {
                setErrorMsg(res.error === "CredentialsSignin"
                    ? "Email atau password salah."
                    : res.error);
            } else if (res?.ok) {
                router.push("/admin");
            }
        } catch {
            setErrorMsg("Terjadi kesalahan koneksi.");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") {
        return <PageWrap><Spinner /></PageWrap>;
    }

    return (
        <>
            <Head>
                <title>Login — Admin</title>
                <meta name="robots" content="noindex,nofollow" />
            </Head>

            <PageWrap>
                <TopBar>
                    <ThemeToggle size={34} />
                </TopBar>

                <Card>
                    <AvatarBox>
                        <AvatarImg src="/avatar.png" alt="Fadd" />
                    </AvatarBox>
                    <CardTitle>Admin Portal</CardTitle>
                    <CardSub>Fadd Graphics</CardSub>

                    {errorMsg && (
                        <ErrorAlert>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span>{errorMsg}</span>
                        </ErrorAlert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <InputWrap>
                            <Label htmlFor="login-email">Email / Username</Label>
                            <Input
                                id="login-email"
                                type="text"
                                placeholder="fadd3079@gmail.com"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                                autoComplete="username"
                            />
                        </InputWrap>

                        <InputWrap>
                            <Label htmlFor="login-pw">Password</Label>
                            <PwRow>
                                <Input
                                    id="login-pw"
                                    type={showPw ? "text" : "password"}
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    autoComplete="current-password"
                                    style={{ paddingRight: '38px' }}
                                />
                                <EyeBtn type="button" onClick={() => setShowPw(!showPw)} tabIndex={-1} aria-label="Toggle password">
                                    {showPw ? (
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </EyeBtn>
                            </PwRow>
                        </InputWrap>

                        <SubmitBtn type="submit" disabled={loading}>
                            {loading ? (
                                <BtnLoading>
                                    <MiniSpinner />
                                    <span>Memverifikasi...</span>
                                </BtnLoading>
                            ) : (
                                "Masuk"
                            )}
                        </SubmitBtn>
                    </Form>

                    <BackLink href="/" target="_blank" rel="noreferrer">
                        ← Kembali ke Website
                    </BackLink>
                </Card>
            </PageWrap>
        </>
    );
}

/* ── Styled Components (themed) ── */

const PageWrap = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: ${({ theme }) => theme.bg.primary};
  position: relative;
`;

const TopBar = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
`;

const Spinner = styled.div`
  width: 28px;
  height: 28px;
  border: 2.5px solid ${({ theme }) => theme.bg.cardBorder};
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const MiniSpinner = styled.div`
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const Card = styled.div`
  width: 100%;
  max-width: 380px;
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  border-radius: 16px;
  padding: 32px 24px 24px;
  box-shadow: ${({ theme }) => theme.bg.cardShadow};
  text-align: center;

  @media screen and (max-width: 480px) {
    padding: 24px 18px 20px;
  }
`;

const AvatarBox = styled.div`
  margin-bottom: 10px;
`;

const AvatarImg = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${({ theme }) => theme.bg.cardBorder};
`;

const CardTitle = styled.h1`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  margin: 0 0 2px;
  letter-spacing: -0.3px;
`;

const CardSub = styled.p`
  font-size: 12.5px;
  color: ${({ theme }) => theme.text.secondary};
  margin: 0 0 18px;
`;

const ErrorAlert = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 12px;
  border-radius: 10px;
  margin-bottom: 14px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.18);
  color: #ef4444;
  font-size: 12.5px;
  font-weight: 500;
  text-align: left;

  svg { flex-shrink: 0; }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
`;

const InputWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 500;
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  background: ${({ theme }) => theme.bg.primary};
  color: ${({ theme }) => theme.text.primary};
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &::placeholder {
    color: ${({ theme }) => theme.text.placeholder};
    font-weight: 400;
  }

  &:disabled {
    opacity: 0.55;
  }
`;

const PwRow = styled.div`
  position: relative;
`;

const EyeBtn = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.text.tertiary};
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;

  &:hover { color: ${({ theme }) => theme.text.primary}; }
`;

const SubmitBtn = styled.button`
  width: 100%;
  margin-top: 4px;
  padding: 11px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  background: ${({ theme }) => theme.bg.featuredCard};
  color: ${({ theme }) => theme.bg.featuredText};
  border: 1px solid ${({ theme }) => theme.bg.featuredBorder};
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.bg.featuredCardHover};
    border-color: ${({ theme }) => theme.bg.featuredBorderHover};
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }
`;

const BtnLoading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const BackLink = styled.a`
  display: inline-block;
  margin-top: 18px;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.text.tertiary};
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.text.primary};
  }
`;
