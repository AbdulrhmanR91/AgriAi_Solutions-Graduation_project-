import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Phone, MapPin, Calendar, Clock, User } from "lucide-react";

const ConsultationsPage = () => {
  const [status, setStatus] = useState("all");

  const [consultations, setConsultations] = useState([
    {
      id: 1,
      clientName: "Ahmed Mohamed",
      phone: "+20 123 456 7890",
      location: "Alexandria, Egypt",
      type: "Agricultural Consultation",
      price: "EGP 500",
      status: "pending",
      appointmentDate: "2024-12-25",
      appointmentTime: "10:00",
      problem: "Issues with tomato crop",
    },
    {
      id: 2,
      clientName: "Mohamed Ali",
      phone: "+20 111 222 3333",
      location: "Giza, Egypt",
      type: "Technical Consultation",
      price: "EGP 300",
      status: "completed",
      appointmentDate: "2024-12-24",
      appointmentTime: "14:00",
      problem: "Crop quality improvement",
    },
  ]);

  const handleComplete = (id) => {
    setConsultations(
      consultations.map((consultation) =>
        consultation.id === id
          ? { ...consultation, status: "completed" }
          : consultation
      )
    );
  };

  const filtered =
    status === "all"
      ? consultations
      : consultations.filter((consultation) => consultation.status === status);

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 bg-white shadow-sm z-10 p-4">
        <h1 className="text-xl font-bold text-green-600">
          Consultations Management
        </h1>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setStatus("all")}
            className={`px-4 py-2 rounded-full ${
              status === "all"
                ? "bg-green-500 text-white"
                : "bg-white border border-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatus("pending")}
            className={`px-4 py-2 rounded-full ${
              status === "pending"
                ? "bg-green-500 text-white"
                : "bg-white border border-gray-200"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatus("completed")}
            className={`px-4 py-2 rounded-full ${
              status === "completed"
                ? "bg-green-500 text-white"
                : "bg-white border border-gray-200"
            }`}
          >
            Completed
          </button>
        </div>

        <div className="space-y-4">
          {filtered.map((consultation) => (
            <Card key={consultation.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg">{consultation.type}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                      consultation.status
                    )}`}
                  >
                    {consultation.status}
                  </span>
                </div>

                <div className="space-y-3 text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span>{consultation.clientName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    <a
                      href={`tel:${consultation.phone}`}
                      className="text-green-600"
                    >
                      {consultation.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{consultation.location}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>
                      {new Date(
                        consultation.appointmentDate
                      ).toLocaleDateString()}
                    </span>
                    <Clock className="w-5 h-5 ml-4" />
                    <span>{consultation.appointmentTime}</span>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm">Problem: {consultation.problem}</p>
                  </div>

                  {consultation.status === "pending" && (
                    <div className="mt-4">
                      <button
                        onClick={() => handleComplete(consultation.id)}
                        className="w-full bg-green-500 text-white py-2 rounded-lg"
                      >
                        Mark as Completed
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ConsultationsPage;
