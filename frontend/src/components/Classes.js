import React, { useEffect, useState } from "react";
import { getReservations, cancelReservation } from "../api";
import { addToCalendar } from "../utils/calendarUtils";
import { classIcons, getClassCategory } from "../utils/classIconUtils";
import { Calendar, Clock, MapPin, X, MoreVertical, ChevronRight } from "lucide-react";
import dayjs from "dayjs";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [expandedMenu, setExpandedMenu] = useState(null);

  useEffect(() => {
    getReservations().then((data) => {
      if (data.Success) {
        setClasses(data.Value);
      }
    });
  }, []);

  const handleCancelReservation = async (classId, trainingId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this class?");
    if (!confirmCancel) return;

    try {
      const response = await cancelReservation(classId, trainingId);
      if (response.Success) {
        alert("Class reservation canceled successfully!");
        setClasses(classes.filter((cls) => cls.ClassReservationID !== classId));
      } else {
        alert("Failed to cancel class. Please try again.");
      }
    } catch (error) {
      console.error("Error canceling class:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const toggleMenu = (classId) => {
    setExpandedMenu(expandedMenu === classId ? null : classId);
  };

  // Group classes by date
  const groupedClasses = classes.reduce((acc, cls) => {
    const date = dayjs(cls.ReserveDate).format("YYYY-MM-DD");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(cls);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Classes</h2>

        {classes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center max-w-md mx-auto">
            <div className="text-gray-400 mb-2">
              <Calendar className="w-10 h-10 mx-auto opacity-50" />
            </div>
            <p className="text-gray-600">No upcoming classes</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedClasses).map(([date, dateClasses]) => {
              const isToday = dayjs(date).isSame(dayjs(), "day");
              const headerText = isToday
                ? "Today"
                : dayjs(date).format("dddd, MMMM D");

              return (
                <div key={date}>
                  <div className="flex items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-500">
                      {headerText}
                    </h3>
                    <div className="ml-2 h-px bg-gray-200 flex-grow"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                    {dateClasses.map((cls) => {
                      const classCategory = getClassCategory(cls.ClassName);
                      const classTime = dayjs(cls.ReserveDate).format("h:mm A");
                      const isWaitlisted = !cls.SpotDisplayNumber;

                      return (
                        <div
                          key={cls.ClassReservationID}
                          className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
                        >
                          <div className="p-4">
                            <div className="flex items-start">
                              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                {classIcons[classCategory]}
                              </div>

                              <div className="ml-3 flex-grow">
                                <div className="flex justify-between">
                                  <h3 className="font-medium text-gray-900">
                                    {cls.ClassName}
                                  </h3>
                                  <button
                                    onClick={() => toggleMenu(cls.ClassReservationID)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <MoreVertical className="w-5 h-5" />
                                  </button>
                                </div>
                                <p className="text-sm text-gray-500">
                                  with {cls.InstructorName}
                                </p>

                                <div className="flex items-center mt-2">
                                  <div className="flex items-center text-sm text-gray-500 mr-4">
                                    <Clock className="w-3.5 h-3.5 mr-1" />
                                    {classTime}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <MapPin className="w-3.5 h-3.5 mr-1" />
                                    {isWaitlisted ? (
                                      <span className="text-amber-600 font-medium">Waitlisted</span>
                                    ) : (
                                      <>Spot {cls.SpotDisplayNumber}</>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {expandedMenu === cls.ClassReservationID && (
                            <div className="border-t border-gray-100">
                              <div className="grid grid-cols-2 divide-x divide-gray-100">
                                <button
                                  onClick={() => addToCalendar(cls)}
                                  className="flex items-center justify-center py-3 text-sm font-medium text-emerald-600 hover:bg-emerald-50"
                                >
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Add to Calendar
                                </button>
                                <button
                                  onClick={() => handleCancelReservation(cls.ClassReservationID, cls.TrainingAppointmentID)}
                                  className="flex items-center justify-center py-3 text-sm font-medium text-red-500 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Classes;