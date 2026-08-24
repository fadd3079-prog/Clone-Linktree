import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import styled, { keyframes, css } from "styled-components";

export default function AdminLogin() {
    const { status } = useSession();
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/admin");
        }
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
                password: password
            });

            if (res?.error) {
                setErrorMsg(res.error === "CredentialsSignin"
                    ? "Email atau password salah."
                    : res.error);
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
            <PageWrap>
                <AnimatedBg />
                <CenterBox>
                    <PulseRing />
                </CenterBox>
            </PageWrap>
        );
    }

    return (
        <>
            <Head>
                <title>Login — Fadd Graphics Admin</title>
                <meta name="robots" content="noindex,nofollow" />
            </Head>

            <PageWrap>
                <AnimatedBg />
                <NoiseOverlay />

                {/* Floating orbs */}
                <Orb style={{ width: 340, height: 340, top: '-8%', left: '-6%', background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)' }} />
                <Orb style={{ width: 260, height: 260, bottom: '-5%', right: '-4%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }} />
                <Orb style={{ width: 180, height: 180, top: '35%', right: '12%', background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)' }} />

                <GlassCard>
                    {/* Brand header */}
                    <BrandSection>
                        <LogoMark>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#g1)" strokeWidth="1.5" strokeLinejoin="round"/>
                                <path d="M2 17L12 22L22 17" stroke="url(#g2)" strokeWidth="1.5" strokeLinejoin="round"/>
                                <path d="M2 12L12 17L22 12" stroke="url(#g3)" strokeWidth="1.5" strokeLinejoin="round"/>
                                <defs>
                                    <linearGradient id="g1" x1="2" y1="2" x2="22" y2="12">
                                        <stop stopColor="#3b82f6"/><stop offset="1" stopColor="#8b5cf6"/>
                                    </linearGradient>
                                    <linearGradient id="g2" x1="2" y1="17" x2="22" y2="22">
                                        <stop stopColor="#8b5cf6"/><stop offset="1" stopColor="#06b6d4"/>
                                    </linearGradient>
                                    <linearGradient id="g3" x1="2" y1="12" x2="22" y2="17">
                                        <stop stopColor="#3b82f6"/><stop offset="1" stopColor="#06b6d4"/>
                                    </linearGradient>
                                </defs>
                            </svg>
                        </LogoMark>
                        <BrandName>Fadd Graphics</BrandName>
                        <BrandTagline>Enterprise Admin Portal</BrandTagline>
                    </BrandSection>

                    {/* Divider */}
                    <GlowDivider />

                    {/* Error alert */}
                    {errorMsg && (
                        <ErrorBox>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="15" y1="9" x2="9" y2="15"/>
                                <line x1="9" y1="9" x2="15" y2="15"/>
                            </svg>
                            <span>{errorMsg}</span>
                        </ErrorBox>
                    )}

                    {/* Form */}
                    <LoginForm onSubmit={handleSubmit}>
                        <InputGroup focused={focusedField === 'email'} hasValue={username.length > 0}>
                            <InputIcon>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <rect x="2" y="4" width="20" height="16" rx="3"/>
                                    <path d="M22 7L13.03 12.7a1.94 1.94 0 01-2.06 0L2 7"/>
                                </svg>
                            </InputIcon>
                            <StyledInput
                                type="text"
                                placeholder="Email atau username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                disabled={loading}
                                autoComplete="username"
                            />
                        </InputGroup>

                        <InputGroup focused={focusedField === 'password'} hasValue={password.length > 0}>
                            <InputIcon>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                                </svg>
                            </InputIcon>
                            <StyledInput
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                disabled={loading}
                                autoComplete="current-password"
                            />
                            <EyeToggle
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? (
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                                        <line x1="1" y1="1" x2="23" y2="23"/>
                                    </svg>
                                ) : (
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                )}
                            </EyeToggle>
                        </InputGroup>

                        <SubmitButton type="submit" disabled={loading}>
                            {loading ? (
                                <LoadingContent>
                                    <ButtonSpinner />
                                    <span>Memverifikasi...</span>
                                </LoadingContent>
                            ) : (
                                <ButtonContent>
                                    <span>Masuk ke Dashboard</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="5" y1="12" x2="19" y2="12"/>
                                        <polyline points="12 5 19 12 12 19"/>
                                    </svg>
                                </ButtonContent>
                            )}
                        </SubmitButton>
                    </LoginForm>

                    {/* Footer */}
                    <FooterLink href="/" target="_blank" rel="noreferrer">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="19" y1="12" x2="5" y2="12"/>
                            <polyline points="12 19 5 12 12 5"/>
                        </svg>
                        <span>Kembali ke Website</span>
                    </FooterLink>
                </GlassCard>

                {/* Copyright */}
                <CopyrightText>© 2026 Fadd Graphics. Protected Access.</CopyrightText>
            </PageWrap>
        </>
    );
}

/* ── Animations ── */
const bgShift = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

const pulseGlow = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.08); }
`;

const pulseRing = keyframes`
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(2.2); opacity: 0; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

/* ── Styled Components ── */
const PageWrap = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 24px 16px;
`;

const AnimatedBg = styled.div`
  position: fixed;
  inset: 0;
  z-index: -2;
  background: linear-gradient(
    135deg,
    #020617 0%,
    #0f172a 25%,
    #020617 50%,
    #0c1222 75%,
    #020617 100%
  );
  background-size: 400% 400%;
  animation: ${bgShift} 18s ease infinite;
`;

const NoiseOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: -1;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
`;

const Orb = styled.div`
  position: fixed;
  border-radius: 50%;
  z-index: -1;
  animation: ${pulseGlow} 6s ease-in-out infinite;
  pointer-events: none;
`;

const CenterBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PulseRing = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(99, 102, 241, 0.6);
  animation: ${pulseRing} 1.2s ease-out infinite;
`;

const GlassCard = styled.div`
  width: 100%;
  max-width: 400px;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 20px;
  padding: 36px 28px 28px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.03) inset,
    0 24px 48px -12px rgba(0, 0, 0, 0.5),
    0 0 64px -8px rgba(59, 130, 246, 0.06);
  animation: ${slideUp} 0.5s ease-out;
  position: relative;
  z-index: 1;

  @media screen and (max-width: 480px) {
    padding: 28px 20px 22px;
    border-radius: 16px;
  }
`;

const BrandSection = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const LogoMark = styled.div`
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BrandName = styled.h1`
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.4px;
  color: #f1f5f9;
  margin: 0 0 4px;
  background: linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const BrandTagline = styled.p`
  font-size: 12.5px;
  font-weight: 500;
  color: #64748b;
  margin: 0;
  letter-spacing: 0.3px;
`;

const GlowDivider = styled.div`
  height: 1px;
  margin: 0 0 20px;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.25), rgba(139, 92, 246, 0.2), transparent);
`;

const ErrorBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  margin-bottom: 16px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.18);
  color: #fca5a5;
  font-size: 12.5px;
  font-weight: 500;

  svg {
    flex-shrink: 0;
    color: #f87171;
  }
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InputGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 10px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid ${({ focused }) => focused
    ? 'rgba(99, 102, 241, 0.45)'
    : 'rgba(148, 163, 184, 0.08)'};
  transition: all 0.25s ease;
  box-shadow: ${({ focused }) => focused
    ? '0 0 0 3px rgba(99, 102, 241, 0.08), 0 0 16px -4px rgba(99, 102, 241, 0.15)'
    : 'none'};

  &:hover {
    border-color: ${({ focused }) => focused
      ? 'rgba(99, 102, 241, 0.45)'
      : 'rgba(148, 163, 184, 0.14)'};
  }
`;

const InputIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 14px;
  color: #475569;
  flex-shrink: 0;
  transition: color 0.2s;

  ${InputGroup}:focus-within & {
    color: #818cf8;
  }
`;

const StyledInput = styled.input`
  flex: 1;
  padding: 12px 12px;
  border: none;
  background: transparent;
  font-size: 13.5px;
  font-weight: 500;
  color: #e2e8f0;
  outline: none;
  font-family: inherit;

  &::placeholder {
    color: #475569;
    font-weight: 400;
  }

  &:disabled {
    opacity: 0.5;
  }
`;

const EyeToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0 14px 0 6px;
  color: #475569;
  cursor: pointer;
  transition: color 0.15s;

  &:hover {
    color: #94a3b8;
  }
`;

const SubmitButton = styled.button`
  margin-top: 6px;
  padding: 12px 20px;
  border-radius: 10px;
  border: none;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  color: #ffffff;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%);
  background-size: 200% 200%;
  animation: ${shimmer} 3s ease infinite;
  transition: all 0.25s ease;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.2),
    0 4px 12px -2px rgba(99, 102, 241, 0.25);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.3),
      0 8px 20px -4px rgba(99, 102, 241, 0.35);
  }

  &:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const LoadingContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const ButtonSpinner = styled.div`
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
`;

const FooterLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 20px;
  font-size: 12px;
  font-weight: 500;
  color: #475569;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: #818cf8;
  }
`;

const CopyrightText = styled.p`
  position: absolute;
  bottom: 16px;
  font-size: 11px;
  color: rgba(71, 85, 105, 0.5);
  letter-spacing: 0.2px;
  margin: 0;
`;
