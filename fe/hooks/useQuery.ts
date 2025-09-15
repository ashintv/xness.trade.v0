import { useState } from "react";
export  function useQuery(fetchFunction:()=>Promise<{data:any}>){
    const [loading , setLoading ]= useState<boolean>(false)
    const [res , setResponse] = useState<{data:any} | null>(null)
    const [error , setError] = useState<any>(null)
    async function fetchData(){
        setLoading(true)
        try{
            const response = await fetchFunction()
            setResponse(response)
        }catch(err){
            setError(err)
        }finally{
            setLoading(false)
        }
    }
    fetchData()
    return { loading, res, error }
}