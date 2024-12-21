import Image from "next/image";
import DashboardStats from "./components/Home/DashboardStats/DashboardStats";
import StudentTable from "./components/Home/StudentsTable/StudentsTable";
import ClassForm from "./components/Home/ClassForm/ClassForm";
import ClassTable from "./components/ClassTable/ClassTable";

export default function Home() {
  return (
    <div className="">
      {/* <ClassForm/>
<DashboardStats/>
<StudentTable/> */}
<ClassTable/>
    </div>
  );
}
