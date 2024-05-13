/* eslint-disable @typescript-eslint/no-explicit-any */
import {Button, Form, Input} from 'antd'
import {getAdditionalUserInfo, signInWithPopup} from 'firebase/auth'
import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import {useEffect, useRef, useState} from 'react'
import './App.css'
import {auth, firestore} from './config/firebase'
import {googleProvider} from './context'

function App() {
  const [userInfor, setUserInfor] = useState<any>()
  const [listUsers, setListUsers] = useState<any[]>([])
  const [listMessages, setListMessages] = useState<any>()
  const [listRooms, setListRooms] = useState<any[]>([])
  const [roomSelectedId, setRoomSelectedId] = useState<string>('')
  const inputRef = useRef<any>(null)
  const [inputValue, setInputValue] = useState('')

  const handleInputOnchange = (evt: any) => {
    setInputValue(evt.target.value)
  }

  const messageListRef = useRef<any>(null)
  useEffect(() => {
    // scroll to bottom after message changed
    if (messageListRef?.current) {
      messageListRef.current.scrollTop =
        messageListRef.current.scrollHeight + 50
    }
  }, [listMessages])

  const [form] = Form.useForm()

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      const infor = await getAdditionalUserInfo(result)

      // Get the current server timestamp
      const timestamp = serverTimestamp()
      if (!infor?.isNewUser) {
        // Save user data to Firestore
        await addDoc(collection(firestore, 'users'), {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: timestamp,
          updatedAt: timestamp,
          // Add any additional fields you want to save
        })
      }
      setUserInfor(user)
      localStorage.setItem('user', JSON.stringify(user))
    } catch (error) {
      console.log(error)
    }
  }

  const getListUsers = async () => {
    const querySnapshot =
      (await (
        await getDocs(collection(firestore, 'users'))
      ).docs.map((doc) => doc.data())) || []
    setListUsers(querySnapshot.filter((user) => user.email !== userInfor.email))
  }

  const getListRooms = async () => {
    const querySnapshot =
      (await (
        await getDocs(collection(firestore, 'rooms'))
      ).docs.map((doc) => doc.data())) || []
    setListRooms(querySnapshot)
  }

  const createRoomChat = async (user: any) => {
    try {
      const id = Date.now() + '-' + userInfor.email + '-' + user.email
      await addDoc(collection(firestore, 'rooms'), {
        id,
        member: [
          {email: user.email, uid: user.uid},
          {email: userInfor.email, uid: userInfor.uid},
        ],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.log(error)
    }
  }

  const selectRoomChat = async (room: any) => {
    const q = query(
      collection(firestore, 'messages'),
      where('roomId', '==', room.id),
    )
    onSnapshot(q, (querySnapshot) => {
      const docs: any[] = querySnapshot.docs.map((doc) => doc.data())
      setListMessages(docs)
    })

    setRoomSelectedId(room.id)
  }

  const handleOnSubmit = () => {
    addDoc(collection(firestore, 'messages'), {
      uid: userInfor?.uid,
      email: userInfor?.email,
      text: inputValue,
      roomId: roomSelectedId,
    })
    form.resetFields(['message'])

    const timeout = setTimeout(() => {
      inputRef.current.focus({
        cursor: 'start',
      })
    }, 10)
    return clearTimeout(timeout)
  }

  useEffect(() => {
    const user = localStorage.getItem('user') as string
    setUserInfor(JSON.parse(user))
  }, [])

  return (
    <>
      {userInfor ? (
        <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
          <div>
            my email:
            {userInfor?.email}
          </div>

          <button onClick={getListUsers}>get list users</button>
          {listUsers.length > 0 && (
            <>
              <div>List users</div>
              {listUsers.map((user) => (
                <div
                  key={user.uid}
                  style={{display: 'flex', gap: 10, alignItems: 'center'}}
                >
                  <div>user email: {user.email}</div>{' '}
                  <button key={user.uid} onClick={() => createRoomChat(user)}>
                    create chat
                  </button>
                </div>
              ))}
            </>
          )}
          <button onClick={getListRooms}>get list rooms</button>
          {listRooms.length > 0 && (
            <>
              <div>List Roms</div>
              {listRooms.map((room) => (
                <div
                  key={room.id}
                  style={{display: 'flex', gap: 10, alignItems: 'center'}}
                >
                  <div>id room: {room.id}</div>
                  <button key={room.id} onClick={() => selectRoomChat(room)}>
                    chat
                  </button>
                </div>
              ))}
            </>
          )}

          {roomSelectedId && (
            <div
              style={{
                padding: 10,
                border: '1px solid red',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}
            >
              <div>Message window</div>
              {listMessages?.length > 0 && (
                <div className="chat-window">
                  {listMessages.map((mess: any) => (
                    <div
                      key={mess.uid}
                      style={{
                        display: 'flex',
                        gap: 20,
                        alignItems: 'center',
                        justifyContent:
                          mess.uid === userInfor.uid
                            ? 'flex-end'
                            : 'flex-start',
                      }}
                    >
                      <div>{mess.email}:</div>
                      <div>{mess.text}</div>
                    </div>
                  ))}
                </div>
              )}

              <Form form={form}>
                <Form.Item name={'message'}>
                  <Input
                    autoComplete="off"
                    placeholder="Enter message..."
                    onChange={handleInputOnchange}
                    onPressEnter={handleOnSubmit}
                    ref={inputRef}
                  />
                </Form.Item>
                <Button type="primary" onClick={handleOnSubmit}>
                  Send
                </Button>
              </Form>
            </div>
          )}
        </div>
      ) : (
        <button onClick={handleGoogleSignIn}>login with google</button>
      )}
    </>
  )
}

export default App
