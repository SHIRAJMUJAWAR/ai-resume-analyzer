import Navbar from "~/componets/Navbar";
import type { Route } from "./+types/home";

import Resumecard from "~/componets/Resumecard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
 
 
  
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
   const { auth,kv} = usePuterStore()
 const navigate =useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loadingResume , setloadingResume] =useState(false)
 

 useEffect( () => {
     if(!auth.isAuthenticated) navigate('/auth?next=/')
 }, [auth.isAuthenticated]);


useEffect(() => {   
  const loadResume = async () => {
    setloadingResume(true)

    const resumes =(await kv.list('resume:*',true)) as KVItem[]

    const parsedResume = resumes?.map((resume) => (
      JSON.parse(resume.value) as Resume
    ))

    console.log(parsedResume);
    

    setResumes(parsedResume || [])
    setloadingResume(false)
  }

},[])
 

  return  <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar></Navbar>
   <section className="main-section">
    <div className="page-heading py-16">
      <h1> Track your Appliction & Resume Rating</h1>
    { !loadingResume && resumes.length === 0 ?(
      <h2>No resumes found. Upload Your frist resume to get fedback</h2>
       
    ):(
      <h2>Review your submission and check AI-powered feedback</h2>
    )}  
</div>
      
       { loadingResume &&(
        <div className="flex flex-col items-center justify-center">
          <img src="/images/resume-scan-2.gif" className="w-[200px]" />
        </div>
       )}
 
         <div className="resumes-section">
          {resumes.map((resume) => (
                <Resumecard key={resume.id} resume={resume}/>
          ))}
        </div>
    

      { !loadingResume && resumes?.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-10 gap-4">
          <Link to={'/upload'} className="primary-button w-fit text-xl font-semibold ">
          Upload Resume
          </Link>
        </div>
      )}
 
   </section>
    <img 
  src="public\images\shiajlodo1.jpg" 
  alt="Description" 
  className="mt-20 h-10 mr-0.5 mb-1.5 w-[100px] rounded-4xl border border-black   p-1  
  object-cover"
/>
  </main>

        }