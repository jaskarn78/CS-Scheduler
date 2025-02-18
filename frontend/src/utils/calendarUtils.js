export const addToCalendar = (cls) => {
    const startDate = new Date(cls.ReserveDate);
    const endDate = new Date(startDate.getTime() + 45 * 60 * 1000); // Class duration = 45 minutes
    const timestamp = new Date();

    const formatToICS = (date) => 
        date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const dtStart = formatToICS(startDate);
    const dtEnd = formatToICS(endDate);
    const dtStamp = formatToICS(timestamp);

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${cls.ClassName}
DTSTART:${dtStart}
DTEND:${dtEnd}
DTSTAMP:${dtStamp}
UID:${Date.now()}-${cls.ClassName.replace(/\s+/g, "")}
DESCRIPTION:Instructor: ${cls.InstructorName}\\nSpot: ${cls.SpotDisplayNumber || "Waitlisted"}
LOCATION:Club Studio 7440 Elk Grove Blvd, Elk Grove, CA 95757
STATUS:${cls.IsCancelledClass ? "CANCELLED" : "CONFIRMED"}
PRIORITY:0
END:VEVENT
END:VCALENDAR`.replace(/\n/g, "\r\n"); // iOS requires CRLF (`\r\n`)

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${cls.ClassName.replace(/\s+/g, "_")}_Event.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};