import WebLinks from '../components/WebLinks';
import Seo from '../components/Seo';
import seoData from '../next-seo.config';
import clientPromise from '../lib/mongodb';

export default function Home({ initialLinks }) {
  const page = {
    title: seoData.openGraph.title,
    excerpt: 'home',
    slug: '/',
    coverImage: seoData.openGraph.images[0].url,
  };
  return (
    <>
      <Seo page={page} />
      <WebLinks initialLinks={initialLinks} />
    </>
  );
}

export async function getServerSideProps() {
  try {
    const client = await clientPromise;
    const db = client.db("linktree_clone");
    const links = await db.collection("links")
      .find({})
      .sort({ order: 1, _id: 1 })
      .toArray();

    // Serialize MongoDB ObjectIds
    const serializedLinks = links.map(link => {
      const { _id, ...rest } = link;
      return { _id: _id.toString(), ...rest };
    });

    return {
      props: {
        initialLinks: JSON.parse(JSON.stringify(serializedLinks))
      }
    };
  } catch (error) {
    console.error("Home page SSR error:", error);
    return {
      props: {
        initialLinks: []
      }
    };
  }
}
