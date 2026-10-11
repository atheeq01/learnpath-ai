export default function AuthLayout({ title, description, children }) {
  return (
    <main id="main-content" className="page-container">
      <section className="mx-auto max-w-sm py-6 sm:py-10">
        <h1>{title}</h1>
        <p className="mb-7 mt-2 text-sm text-pine-700">{description}</p>
        {children}
      </section>
    </main>
  );
}
