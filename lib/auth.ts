import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

const googleProvider = new GoogleAuthProvider()
googleProvider.addScope("email")
googleProvider.addScope("profile")

export interface UserData {
  email: string
  firstName: string
  lastName: string
  photo: string
  saldo_mens: number
  mensagensRest: number
  redacoesRest: number
  lastMessageDate: string
  createdAt: string
  lastLogin: string
  provider: string
}

export const createOrUpdateUserData = async (
  user: User,
  additionalData: Partial<UserData> = {}
) => {
  try {
    const userRef = doc(db, "Users", user.uid)
    const userDoc = await getDoc(userRef)

    const currentDate = new Date()
    const userData: UserData = {
      email: user.email || "",
      firstName: additionalData.firstName || user.displayName?.split(" ")[0] || "",
      lastName: additionalData.lastName || user.displayName?.split(" ").slice(1).join(" ") || "",
      photo: user.photoURL || "",
      saldo_mens: 30,
      mensagensRest: 30,
      redacoesRest: 2,
      lastMessageDate: currentDate.toISOString(),
      createdAt: currentDate.toISOString(),
      lastLogin: currentDate.toISOString(),
      provider: user.providerData[0]?.providerId || "email",
      ...additionalData,
    }

    if (!userDoc.exists()) {
      // Usuário novo - criar dados completos
      await setDoc(userRef, userData)

      // Criar estrutura de dados do ENEM
      const enemDataRef = collection(userRef, "EnemData")
      await addDoc(enemDataRef, {
        espanhol: { acertos: 0, erros: 0 },
        Ingles: { acertos: 0, erros: 0 },
        ling: { acertos: 0, erros: 0 },
        matematica: { acertos: 0, erros: 0 },
        cienciasHumanas: { acertos: 0, erros: 0 },
        cienciasDaNatureza: { acertos: 0, erros: 0 },
        redacao: { notaTotal: 0, redacoesFeitas: 0 },
      })

      console.log("Novo usuário criado com sucesso")
    } else {
      // Usuário existente - atualizar último login
      await setDoc(
        userRef,
        {
          lastLogin: currentDate.toISOString(),
          photo: user.photoURL || userDoc.data()?.photo,
          email: user.email,
        },
        { merge: true }
      )

      console.log("Usuário existente atualizado")
    }

    return true
  } catch (error) {
    console.error("Erro ao criar/atualizar dados do usuário:", error)
    return false
  }
}

export const signUpWithEmail = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    const success = await createOrUpdateUserData(user, { firstName, lastName })

    if (success) {
      return { success: true, user }
    } else {
      throw new Error("Erro ao criar dados do usuário")
    }
  } catch (error: any) {
    const errorCode = error.code
    let message = "Erro ao criar usuário"

    if (errorCode === "auth/email-already-in-use") {
      message = "Email já está em uso!"
    } else if (errorCode === "auth/weak-password") {
      message = "Senha muito fraca. Use pelo menos 6 caracteres."
    }

    return { success: false, error: message }
  }
}

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    await createOrUpdateUserData(user)

    return { success: true, user }
  } catch (error: any) {
    const errorCode = error.code
    let message = "Erro no login"

    if (errorCode === "auth/wrong-password" || errorCode === "auth/user-not-found") {
      message = "Email ou senha incorretos"
    } else if (errorCode === "auth/too-many-requests") {
      message = "Muitas tentativas. Tente novamente mais tarde."
    }

    return { success: false, error: message }
  }
}

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user

    const success = await createOrUpdateUserData(user)

    if (success) {
      return { success: true, user }
    } else {
      throw new Error("Erro ao processar dados do usuário")
    }
  } catch (error: any) {
    let message = "Erro no login com Google"

    if (error.code === "auth/popup-closed-by-user") {
      message = "Login cancelado pelo usuário"
    } else if (error.code === "auth/popup-blocked") {
      message = "Popup bloqueado. Permita popups para este site."
    }

    return { success: false, error: message }
  }
}

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email)
    return { success: true }
  } catch (error: any) {
    let message = "Erro ao enviar email de reset"

    if (error.code === "auth/user-not-found") {
      message = "Email não encontrado no sistema"
    }

    return { success: false, error: message }
  }
}

export const logout = async () => {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error) {
    console.error("Error signing out:", error)
    return { success: false }
  }
}

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}
