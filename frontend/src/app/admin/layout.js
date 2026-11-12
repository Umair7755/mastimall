export const metadata = {
  title: { default: "Admin", template: "%s · Masti Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }) {
  return children;
}
