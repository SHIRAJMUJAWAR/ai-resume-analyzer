import React from 'react'
import ScoreGauge from './ScoreGauge'

const Category = ({title, score} : {title: string, score: number}) => {
   const textColor = score >= 75 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600';

    return(
        <div className='resume-summary'>
            <div className='category'>
                <div className='felx flex-row justify-between items-center'>
                    <p className='text-2xl'> {title } - {score}</p>
                </div>
            </div> 
        </div>
    )
}

const Summary = ( {feedback} : {feedback : Feedback}) => {
  return (
    <div className='bg-white rounded-2xl shadow-md w-full'>
       <div className='flex flex-row p-4 gap-8 items-center '>
         <ScoreGauge score={feedback.overallScore}></ScoreGauge>

         <div className='flex flex-col gap-2'>
           <h2 className='text-2xl font-bold'>Your Resume Score</h2>
           <p className='tetx-sm text-gray-600'>
            This Score is calculated based on the variables listed below
           </p>
         </div>
       </div>
      <Category title='Tone & Style' score={feedback.toneAndStyle.score}/>
      <Category title='Content' score={feedback.content.score}/>
      <Category title='Structure' score={feedback.structure.score}/>
      <Category title='Skills' score={feedback.skills.score}/>
      
    </div>
  )
}

export default Summary
