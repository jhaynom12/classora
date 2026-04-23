"use client";

import { useState, useEffect } from "react";
import SchoolGuardian from "./SchoolGuardian";

export default function ActionButtons() {
  const [user, setUser] = useState<any>(null);
  const [schoolName, setSchoolName] = useState("Your School");

  useEffect(() => {
    const savedUser = localStorage.getItem("classora_user");
    const savedSchool = localStorage.getItem("classora_school_name");
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedSchool) setSchoolName(savedSchool);
  }, []);

  if (!user) return null;

  return (
    <>
      <SchoolGuardian 
        userRole={user.role} 
        userName={user.name} 
        schoolName={schoolName}
        context={{}}
      />
    </>
  );
}
