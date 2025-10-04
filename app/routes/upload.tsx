import React, { useState, type FormEvent } from 'react'
import Navbar from '~/componets/Navbar'
import Fileuploader from './fileuploader';
import { usePuterStore } from '~/lib/puter';
import { useNavigate } from 'react-router';
import { convertPdfToImage} from '~/lib/pdf2img';
import { prepareInstructions } from '~/constants';

const Upload = () => {
  const {auth,isLoading,fs,ai,kv} = usePuterStore()
 const navigate =useNavigate()
 const [isProcessing , setisProcessing ] = useState(false);
 const [statusText , setstatusText] = useState('');
 const [file , setfile] = useState<File |null>(null);

 const handleFileSelect = (file:File |null) => {
    setfile(file)
 }

 const handleAnalyze = async({companyName , jobTitle, jobDescription, file} :{ companyName:string, jobTitle:string , jobDescription:string, file:File}) => {
   setisProcessing(true);
   setstatusText('uploading the file....');

   const uploadedFile =await fs.upload([file])
   if(!uploadedFile) return setstatusText('Error: Failed to upload file')

    setstatusText('Converting to image...')
     const imageFile =await convertPdfToImage(file);
   if(!imageFile.file) return setstatusText('Error: Failed to convert image')

    setstatusText('uploading the image....')
    const uploadedImage = await fs.upload([imageFile.file])
   if(!uploadedImage) return setstatusText('Error: Failed to upload image')
   
    setstatusText('preparing data...');
    const uuid =generateUUID()
    const data ={
      id:uuid,
      resumePath :uploadedFile.path,
      imagePath : uploadedImage.path,
      companyName,jobTitle,jobDescription,
      feedback : ''
    }
    await kv.set(`resume:${uuid}` ,JSON.stringify(data))

    setstatusText('Analyzing...')

    const feedback = await ai.feedback(
      uploadedFile.path,
       prepareInstructions({jobTitle,jobDescription})
    )

    if(!feedback) return setstatusText('Error: Failed to analyze resume');

    const feedbackText = typeof feedback.message.content === 'string'
    ? feedback.message.content
    : feedback.message.content[0].text;

    data.feedback = JSON.parse(feedbackText);
     await kv.set(`resume:${uuid}` ,JSON.stringify(data))
     setstatusText('Analysis complete, redirecting')
     console.log(data);
     
  }

 const handleSubmit = (e: FormEvent<HTMLFormElement>) =>{
  e.preventDefault();
  const form =e.currentTarget.closest('form')
  if(!form) return;
  const formData =new FormData(form)

  const companyName =formData.get('company-name') as string
  const jobTitle =formData.get('job-title') as string
  const jobDescription =formData.get('job-description') as string

  if(!file) return;
  
  handleAnalyze({ companyName, jobTitle,jobDescription,file})

 }

  return ( <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar></Navbar>
   <section className="main-section">
    <div className='page-heading py-16'>
      <h1>Smart feedback for your dream job</h1>
      {isProcessing ? (<>
         <h2>{statusText}</h2>
         <img src="/images/resume-scan.gif"  className='w-full '/>
      </>):(
        <h2>Drop your resume for an ATS score and improment tips</h2>
      )}

     { !isProcessing && (
           <form id='upload-form' onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8'>
           <div className='form-div'>
            <label htmlFor="company-name">Company Name</label>
            <input type="text" name='company-name' placeholder='Company Name' id='company-name'/>
           </div>
          <div className='form-div'>
            <label htmlFor="job-title">Job Title</label>
            <input type="text" name='job-title' placeholder='Job Title' id='job-title'/>
           </div>
          <div className='form-div'>
            <label htmlFor="job-description">job Description</label>
            <textarea  rows={5} name='job-description' placeholder='job Description' id='job-description'/>
           </div>
            <div className='form-div'>
            <label htmlFor="upload">Upload Resume</label>
            <Fileuploader onFileSelect ={handleFileSelect}></Fileuploader>
           </div>
           <button className='primary-button' type='submit'>
            Analyze Resume
           </button>
           </form>
     )}

    </div>
   </section>
   </main>
  )
}

export default Upload


export const  generateUUID = () => crypto.randomUUID();
