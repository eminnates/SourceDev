export const metadata = {
  title: "Contact - SourceDev",
  description: "Get in touch with the SourceDev team",
};

const teamMembers = [
  {
    id: 1,
    name: "Fatih Ersagun TOSUN",
    role: "Frontend Developer",
    email: "223301052@ogr.selcuk.edu.tr"
  },
  {
    id: 2,
    name: "Mehmet Emin ATEŞ",
    role: "Backend Lead Developer",
    email: "223301009@ogr.selcuk.edu.tr"
  },
  {
    id: 3,
    name: "Muammer SÖNMEZ",
    role: "Project Manager",
    email: "223301032@ogr.selcuk.edu.tr"
  },
  {
    id: 4,
    name: "Oğuzhan DÖNER",
    role: "Backend Developer",
    email: "213301123@ogr.selcuk.edu.tr"
  },
  {
    id: 5,
    name: "Mehmet Ersin CERİT",
    role: "Backend Developer",
    email: "2133011220@ogr.selcuk.edu.tr"
  }
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-brand-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-brand-dark mb-4">Contact Us</h1>
          <p className="text-lg text-brand-muted max-w-2xl mx-auto">
            Have questions or feedback? Reach out to our team members below.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-brand-dark mb-6">Team Members</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-brand-primary transition-colors"
                >
                  <h3 className="text-xl font-semibold text-brand-dark mb-2">
                    {member.name}
                  </h3>
                  <p className="text-brand-primary font-medium mb-4">
                    {member.role}
                  </p>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-brand-muted"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <a
                      href={`mailto:${member.email}`}
                      className="text-brand-primary hover:text-brand-primary-dark transition-colors font-medium"
                    >
                      {member.email}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

