import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import styled from "styled-components";
import Head from "next/head";
import ThemeToggle from "../../components/ThemeToggle";

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
            setErrorMsg("Masukkan username dan password.");
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
            setErrorMsg("Terjadi kesalahan sistem.");
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
                <title>Login • Admin</title>
            </Head>
            <LoginWrapper>
                <TopRightToggle>
                    <ThemeToggle size={38} />
                </TopRightToggle>

                <LoginCard>
                    <BrandHeader>
                        <AvatarImg src="/avatar.png" alt="Fadd" />
                        <BrandTitle>Admin Portal</BrandTitle>
                    </BrandHeader>

                    {errorMsg && (
                        <ErrorAlert>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                                    <span>Memproses...</span>
                                </BtnLoadingWrap>
                            ) : (
                                "Masuk"
                            )}
                        </SubmitBtn>
                    </Form>

                    <FooterNote>
                        <a href="/" target="_blank" rel="noreferrer">
                            ← Kembali ke Web
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
  width: 32px;
  height: 32px;
  border: 2.5px solid rgba(0, 0, 0, 0.1);
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const MiniSpinner = styled.div`
  width: 15px;
  height: 15px;
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
  position: relative;
`;

const TopRightToggle = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
`;

const LoginCard = styled.div`
  width: 100%;
  max-width: 380px;
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: ${({ theme }) => theme.bg.cardShadow};

  @media screen and (max-width: 480px) {
    padding: 24px 18px;
  }
`;

const BrandHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 20px;
`;

const AvatarImg = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 14px;
  object-fit: cover;
  margin-bottom: 10px;
  border: 1.5px solid ${({ theme }) => theme.bg.cardBorder};
`;

const BrandTitle = styled.h1`
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: ${({ theme }) => theme.text.primary};
  margin: 0;
`;

const ErrorAlert = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #ef4444;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 500;
  margin-bottom: 16px;

  svg {
    flex-shrink: 0;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: left;
`;

const Label = styled.label`
  font-size: 12.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13.5px;
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  background: ${({ theme }) => theme.bg.primary};
  color: ${({ theme }) => theme.text.primary};
  outline: none;
  transition: border-color 0.15s ease;

  &:focus {
    border-color: #2563eb;
  }

  &::placeholder {
    color: ${({ theme }) => theme.text.placeholder};
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  margin-top: 6px;
  padding: 11px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  background: #2563eb;
  color: #ffffff;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover:not(:disabled) {
    background: #1d4ed8;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const FooterNote = styled.div`
  margin-top: 20px;
  text-align: center;

  a {
    font-size: 12.5px;
    font-weight: 500;
    color: ${({ theme }) => theme.text.secondary};

    &:hover {
      color: ${({ theme }) => theme.text.primary};
    }
  }
`;
