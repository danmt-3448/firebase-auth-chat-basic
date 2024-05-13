/* eslint-disable @typescript-eslint/no-explicit-any */
import {useEffect, useState} from 'react'
import {firestore} from '../config/firebase'
import {collection, onSnapshot, query} from 'firebase/firestore'

const useFirestore = (nameCollection: string, condition?: any) => {
  const [documents, setDocuments] = useState<any[]>([])

  useEffect(() => {
    const q = query(collection(firestore, nameCollection, condition))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs: any[] = querySnapshot.docs.map((doc) => doc.data())
      setDocuments(docs)
    })

    return () => unsubscribe()
  }, [collection, condition])

  return documents
}

export default useFirestore
