export const metadata = {
  title: "About - SourceDev",
  description: "Learn more about SourceDev and our team",
};

const teamMembers = [
  {
    id: 1,
    name: "Fatih Ersagun TOSUN",
    role: "Frontend Developer",
    description: "Frontend developer responsible for the user interface and user experience."
  },
  {
    id: 2,
    name: "Mehmet Emin ATEŞ",
    role: "Backend Lead Developer",
    description: "Backend developer responsible for the backend logic and database design."
  },
  {
    id: 3,
    name: "Muammer SÖNMEZ",
    role: "Project Manager",
    description: "Project manager responsible for the project management and coordination."
  },
  {
    id: 4,
    name: "Oğuzhan DÖNER",
    role: "Backend Developer",
    description: "Backend developer responsible for the backend logic and database design."
  },
  {
    id: 5,
    name: "Mehmet Ersin CERİT",
    role: "Backend Developer",
    description: "Backend developer responsible for the backend logic and database design."
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-brand-dark mb-4">About SourceDev</h1>
          <p className="text-lg text-brand-muted max-w-2xl mx-auto">
            SourceDev is a community platform for developers to share knowledge, 
            collaborate, and grow together.
          </p>
        </div>

        {/* Team Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-brand-dark mb-6">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-brand-primary transition-colors"
                >
                  <h3 className="text-xl font-semibold text-brand-dark mb-2">
                    {member.name}
                  </h3>
                  <p className="text-brand-primary font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-brand-muted leading-relaxed">
                    {member.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

