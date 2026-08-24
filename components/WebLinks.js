// Weblinks Page Sections
// Fadd Graphics Official Directory

import { useState, useEffect } from "react";
import styled from "styled-components";
import { Container } from "./ReusableStyles";
import { HexIcon, NewUp, OvalIcon } from './icons';
import defaultLinks from "../data/LinksData";
import bioData from "../data/BioData";
import ThemeToggle from "./ThemeToggle";

const Links = ({ initialLinks }) => {
  // Use initialLinks from SSR, fallback to defaultLinks if empty
  const defaultList = Array.isArray(initialLinks) && initialLinks.length > 0 ? initialLinks : defaultLinks;
  const [linksList, setLinksList] = useState(defaultList);

  useEffect(() => {
    // If initialLinks was updated, sync it
    if (Array.isArray(initialLinks) && initialLinks.length > 0) {
      setLinksList(initialLinks);
    }
  }, [initialLinks]);

  // Track click event asynchronously
  const handleLinkClick = (link) => {
    try {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkId: link._id || null,
          title: link.title,
          url: link.url
        })
      }).catch(() => {});
    } catch (e) {
      // Non-blocking
    }
  };

  // all user info from bioData
  const name = bioData[0].name;
  const url = bioData[0].url;
  const username = bioData[0].username;
  const titleImg = bioData[0].titleImg;
  const avatarImg = bioData[0].avatar;
  const description = bioData[0].description;
  const descShow = bioData[0].descShow;
  const subdesc = bioData[0].subdesc;
  const subdescShow = bioData[0].subdescShow;
  const footerText = bioData[0].footerText;
  const author = bioData[0].author;
  const authorURL = bioData[0].authorURL;
  const titleImage = "/title.svg";

  // Check what class to use oval or hex for avatar
  const avatarShape = bioData[0].nftAvatar ? `nft-clipped` : `oval-clipped`;

  const descriptionText = descShow ? description : '';
  const subdescText = subdescShow ? subdesc : '';

  const newProduct = bioData[0].newProduct;
  const newProductUrl = bioData[0].newProductUrl;

  // Filter top social links
  const social = linksList.filter((el) => el.type === "social" && el.on !== false);

  // Filter categorized links
  const nonSocialLinks = linksList.filter((el) => el.type !== "social" && el.on !== false);
  const categories = Array.from(new Set(nonSocialLinks.map((el) => el.type)));

  return (
    <LinkWrapper>
      <LinkContainer>
        <TopToggleRow>
          <ThemeToggle size={34} />
        </TopToggleRow>
        <TopPart>
          <LinkHeader>
            <Avatar>
              <AvatarWrap>
                <HexIcon />
                <OvalIcon />
                <div className={`${avatarShape} avatar-border`}></div>
                <div className={`${avatarShape} avatar-fill`}></div>
                <img
                  src={avatarImg}
                  className={avatarShape}
                  alt={name}
                />
              </AvatarWrap>
            </Avatar>
            <Title>
              {titleImg ? (
                <img src={titleImage} className="handle" alt={name} />
              ) : (
                <h1>{name}</h1>
              )}
              {username && (
                <h3>
                  <a href={url} target="_blank" rel="noreferrer">
                    {username}
                  </a>
                </h3>
              )}
            </Title>
          </LinkHeader>

          {/* Bio Section */}
          <LinkBio>
            {description && <h1>{descriptionText}</h1>}
            {subdesc && <h4>{subdescText}</h4>}
          </LinkBio>

          {/* Weblinks Container */}
          <WebLinkWrap>
            {/* Social Icons (Instagram @fadd.fadhol, WhatsApp, TikTok) */}
            {social.length > 0 && (
              <SocialSection>
                <div className="iconsonly">
                  {social.map((i) => (
                    <a
                      href={i.url}
                      key={i._id || i.title}
                      target="_blank"
                      rel="noreferrer"
                      title={i.title}
                      onClick={() => handleLinkClick(i)}
                    >
                      <SocialIconBox>
                        <img
                          src={i.icon}
                          style={{ filter: 'var(--img)' }}
                          alt={i.title}
                        />
                      </SocialIconBox>
                    </a>
                  ))}
                </div>
              </SocialSection>
            )}

            {/* Categorized Link Sections */}
            {categories.map((category) => {
              const sectionLinks = nonSocialLinks.filter((el) => el.type === category);
              if (sectionLinks.length === 0) return null;
              return (
                <LinkSection key={category}>
                  <SectionTitle>{category}</SectionTitle>
                  {sectionLinks.map((i) => (
                    <a
                      href={i.url}
                      key={i._id || i.title}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => handleLinkClick(i)}
                    >
                      <LinkBox className={i.featured ? 'featured' : ''}>
                        <LinkLeft>
                          <IconWrapper className={i.featured ? 'featured' : ''}>
                            <img
                              src={i.icon}
                              style={{ filter: i.featured ? 'none' : 'var(--img)' }}
                              alt=""
                            />
                          </IconWrapper>
                          <LinkContent>
                            <LinkHeaderRow>
                              <LinkTitle className={i.featured ? 'featured' : ''}>
                                {i.title}
                              </LinkTitle>
                              {i.badge && (
                                <Badge className={i.featured ? 'featured' : ''}>
                                  {i.badge}
                                </Badge>
                              )}
                            </LinkHeaderRow>
                            {i.featured && i.subtitle && i.subtitle.trim().length > 0 && (
                              <LinkSubtitle className={i.featured ? 'featured' : ''}>
                                {i.subtitle}
                              </LinkSubtitle>
                            )}
                          </LinkContent>
                        </LinkLeft>
                        <ArrowWrap className={i.featured ? 'featured' : ''}>
                          <NewUp />
                        </ArrowWrap>
                      </LinkBox>
                    </a>
                  ))}
                </LinkSection>
              );
            })}

            {/* Featured banner if enabled in BioData */}
            {newProduct && (
              <NewSection>
                <a href={newProductUrl} target="_blank" rel="noreferrer">
                  <img
                    src={'/newproduct.png'}
                    className="newproduct"
                    alt="Featured Product"
                  />
                </a>
              </NewSection>
            )}
          </WebLinkWrap>
        </TopPart>

        <BottomPart>
          <LinkFoot>
            <h4>
              {footerText} <a href={authorURL} target="_blank" rel="noreferrer">{author}</a>
            </h4>
          </LinkFoot>
        </BottomPart>
      </LinkContainer>
    </LinkWrapper>
  );
};

export default Links;

const LinkWrapper = styled(Container)`
  max-width: 580px;
  width: 100%;
`;

const LinkContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  padding: 24px 16px 40px;
  position: relative;
`;

const TopToggleRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 4px;
`;

const LinkHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 32px;
  margin-bottom: 10px;
  @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
    margin-top: 12px;
  }
`;

const Avatar = styled.div`
  height: 88px;
  width: 88px;
  position: relative;
  margin-bottom: 14px;
`;

const AvatarWrap = styled.div`
  height: 100%;
  width: 100%;
  filter: drop-shadow(0px 2px 6px var(--avatar-shadow));
  cursor: default;

  img {
    height: calc(100% - 6px);
    width: calc(100% - 6px);
    object-fit: cover;
  }
  .avatar-border {
    height: 100%;
    width: 100%;
    position: absolute;
    background: ${({ theme }) => theme.bg.primary};
  }
  .avatar-fill {
    height: calc(100% - 6px);
    width: calc(100% - 6px);
    position: absolute;
    background: ${({ theme }) => theme.bg.primary};
  }
`;

const Title = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  h1 {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.6px;
    line-height: 1.2;
    text-transform: none;
    background: ${({ theme }) => theme.text.nameGradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: inline-block;

    @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
      font-size: 24px;
    }
  }

  h3 {
    margin-top: 4px;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: -0.1px;
    text-transform: none;

    a {
      color: ${({ theme }) => theme.text.secondary};
      transition: color 0.15s ease;
      opacity: 0.85;

      &:hover {
        opacity: 1;
        color: ${({ theme }) => theme.text.primary};
      }
    }

    @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
      font-size: 13px;
    }
  }

  .handle {
    height: 28px;
    margin-top: 4px;
    margin-bottom: 4px;
  }
`;

const LinkBio = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 460px;
  margin: 0 auto;

  h1 {
    font-size: 16px;
    line-height: 24px;
    font-weight: 600;
    letter-spacing: -0.2px;
    padding: 0 16px;
    color: ${({ theme }) => theme.text.primary};
    text-transform: none;

    @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
      font-size: 14px;
      line-height: 20px;
      padding: 0 8px;
    }
  }

  h4 {
    font-size: 13.5px;
    line-height: 19px;
    letter-spacing: -0.1px;
    margin: 4px 0 12px;
    color: ${({ theme }) => theme.text.secondary};
    font-weight: 400;
    text-transform: none;

    @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
      font-size: 12.5px;
      line-height: 18px;
      padding: 0 12px;
    }

    a {
      font-weight: 500;
      color: ${({ theme }) => theme.text.primary};
      opacity: 0.85;
      transition: opacity 0.15s ease;

      &:hover {
        opacity: 1;
      }
    }
  }
`;

const TopPart = styled.div`
  width: 100%;
`;

const BottomPart = styled.div`
  margin-top: 32px;
  margin-bottom: 12px;
`;

const LinkFoot = styled.div`
  h4 {
    color: ${({ theme }) => theme.text.tertiary};
    line-height: 22px;
    letter-spacing: -0.1px;
    font-size: 13px;
    font-weight: 400;
    text-transform: none;

    @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
      font-size: 12px;
    }

    a {
      color: ${({ theme }) => theme.text.secondary};
      font-weight: 500;
      transition: color 0.15s ease;
      opacity: 0.85;

      &:hover {
        opacity: 1;
        color: ${({ theme }) => theme.text.primary};
      }
    }
  }
`;

const WebLinkWrap = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;

  @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
    padding: 0;
  }
`;

const SocialSection = styled.div`
  padding: 6px 0 12px;
  display: flex;
  justify-content: center;

  .iconsonly {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
  }
`;

const SocialIconBox = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  box-shadow: ${({ theme }) => theme.bg.cardShadow};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;

  img {
    height: 18px;
    width: 18px;
    display: block;
  }

  &:hover {
    background: ${({ theme }) => theme.bg.cardHover};
    border-color: ${({ theme }) => theme.bg.cardBorderHover};
    box-shadow: ${({ theme }) => theme.bg.cardShadowHover};
  }

  &:active {
    transform: scale(0.96);
  }

  @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
    width: 38px;
    height: 38px;
    img {
      height: 16px;
      width: 16px;
    }
  }
`;

const LinkSection = styled.div`
  padding: 4px 0 8px;
  display: flex;
  margin: 0 auto;
  width: 100%;
  flex-direction: column;
`;

const SectionTitle = styled.h3`
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.2px;
  margin: 12px 10px 6px;
  text-align: left;
  color: ${({ theme }) => theme.text.primary};
  text-transform: none;

  @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
    font-size: 12px;
    margin: 10px 8px 5px;
  }
`;

const LinkBox = styled.div`
  padding: 13px 16px;
  border-radius: 12px;
  margin: 4px 6px;
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.bg.cardBorder};
  box-shadow: ${({ theme }) => theme.bg.cardShadow};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.bg.cardHover};
    border-color: ${({ theme }) => theme.bg.cardBorderHover};
    box-shadow: ${({ theme }) => theme.bg.cardShadowHover};

    .new-up {
      opacity: 0.85;
    }
  }

  &:active {
    transform: scale(0.99);
  }

  &.featured {
    padding: 16px 18px;
    background: ${({ theme }) => theme.bg.featuredCard};
    border: 1px solid ${({ theme }) => theme.bg.featuredBorder};
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.14);

    &:hover {
      background: ${({ theme }) => theme.bg.featuredCardHover};
      border-color: ${({ theme }) => theme.bg.featuredBorderHover};
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }
  }

  @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
    padding: 12px 14px;
    margin: 4px 4px;

    &.featured {
      padding: 14px 14px;
    }
  }
`;

const LinkLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    height: 20px;
    width: 20px;
    display: block;
  }

  &.featured {
    img {
      filter: brightness(0) invert(1) !important;
    }
  }
`;

const LinkContent = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const LinkHeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const LinkTitle = styled.span`
  font-size: 14.5px;
  font-weight: 500;
  letter-spacing: -0.2px;
  color: ${({ theme }) => theme.text.primary};
  text-transform: none;

  &.featured {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.3px;
    color: ${({ theme }) => theme.bg.featuredText};
  }

  @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
    font-size: 13.5px;

    &.featured {
      font-size: 14px;
    }
  }
`;

const Badge = styled.span`
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 6px;
  text-transform: none;
  background: ${({ theme }) => theme.bg.secondary};
  color: ${({ theme }) => theme.text.primary};

  &.featured {
    font-size: 11px;
    font-weight: 700;
    padding: 2.5px 8px;
    border-radius: 6px;
    background: ${({ theme }) => theme.bg.featuredBadgeBg};
    color: ${({ theme }) => theme.bg.featuredBadgeText};
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
`;

const LinkSubtitle = styled.span`
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  letter-spacing: -0.1px;
  color: ${({ theme }) => theme.text.secondary};
  margin-top: 3px;
  text-transform: none;

  &.featured {
    font-weight: 500;
    color: ${({ theme }) => theme.bg.featuredSubtext};
  }

  @media screen and (max-width: ${({ theme }) => theme.deviceSize.tablet}) {
    font-size: 11.5px;
  }
`;

const ArrowWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 8px;
  color: ${({ theme }) => theme.text.secondary};
  opacity: 0.35;
  transition: opacity 0.15s ease;

  &.featured {
    color: ${({ theme }) => theme.bg.featuredText};
    opacity: 0.95;
  }

  .new-up {
    transform: scale(0.85);
  }
`;

const NewSection = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 6px;

  img {
    width: 100%;
    border: 1px solid ${({ theme }) => theme.bg.cardBorder};
    border-radius: 12px;
    cursor: pointer;
    transition: border-color 0.15s ease;

    &:hover {
      border-color: ${({ theme }) => theme.bg.cardBorderHover};
    }
  }
`;