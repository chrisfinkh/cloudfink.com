import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest'
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore'
import { readFileSync } from 'fs'
import { firebaseConfig } from '../src/firebase/firebaseConfig'

const PROJECT_ID = firebaseConfig.projectId

let testEnv: RulesTestEnvironment

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: 'localhost',
      port: 8080,
    },
  })
})

afterAll(async () => {
  await testEnv.cleanup()
})

beforeEach(async () => {
  await testEnv.clearFirestore()
})

describe('Posts Collection', () => {
  describe('read rules', () => {
    it('allows anyone to read posts', async () => {
      const unauthed = testEnv.unauthenticatedContext()
      const db = unauthed.firestore()

      await assertSucceeds(getDoc(doc(db, 'posts', 'test-post')))
    })

    it('allows anyone to list posts', async () => {
      const unauthed = testEnv.unauthenticatedContext()
      const db = unauthed.firestore()

      await assertSucceeds(getDocs(collection(db, 'posts')))
    })
  })

  describe('create rules', () => {
    it('allows authenticated user to create post with their own authorId', async () => {
      const alice = testEnv.authenticatedContext('alice')
      const db = alice.firestore()

      await assertSucceeds(
        setDoc(doc(db, 'posts', 'new-post'), {
          title: 'Test Post',
          body: 'Content',
          authorId: 'alice',
        })
      )
    })

    it('denies creating post with different authorId', async () => {
      const alice = testEnv.authenticatedContext('alice')
      const db = alice.firestore()

      await assertFails(
        setDoc(doc(db, 'posts', 'new-post'), {
          title: 'Test Post',
          body: 'Content',
          authorId: 'bob', // Not alice!
        })
      )
    })

    it('denies unauthenticated user from creating posts', async () => {
      const unauthed = testEnv.unauthenticatedContext()
      const db = unauthed.firestore()

      await assertFails(
        setDoc(doc(db, 'posts', 'new-post'), {
          title: 'Test Post',
          body: 'Content',
          authorId: 'someone',
        })
      )
    })
  })

  describe('update rules', () => {
    it('allows author to update their own post', async () => {
      // Setup: create a post as admin
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore()
        await setDoc(doc(db, 'posts', 'alice-post'), {
          title: 'Original',
          body: 'Content',
          authorId: 'alice',
        })
      })

      // Test: alice updates her post
      const alice = testEnv.authenticatedContext('alice')
      const db = alice.firestore()

      await assertSucceeds(
        updateDoc(doc(db, 'posts', 'alice-post'), {
          title: 'Updated Title',
          authorId: 'alice', // Must keep same authorId
        })
      )
    })

    it('denies changing authorId (Arc-style attack)', async () => {
      // Setup: create a post owned by alice
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore()
        await setDoc(doc(db, 'posts', 'alice-post'), {
          title: 'Alice Post',
          body: 'Content',
          authorId: 'alice',
        })
      })

      // Attack: alice tries to change authorId to bob
      const alice = testEnv.authenticatedContext('alice')
      const db = alice.firestore()

      await assertFails(
        updateDoc(doc(db, 'posts', 'alice-post'), {
          title: 'Hacked',
          authorId: 'bob', // Trying to change ownership!
        })
      )
    })

    it('denies other users from updating posts', async () => {
      // Setup: create a post owned by alice
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore()
        await setDoc(doc(db, 'posts', 'alice-post'), {
          title: 'Alice Post',
          body: 'Content',
          authorId: 'alice',
        })
      })

      // Test: bob tries to update alice's post
      const bob = testEnv.authenticatedContext('bob')
      const db = bob.firestore()

      await assertFails(
        updateDoc(doc(db, 'posts', 'alice-post'), {
          title: 'Hacked by Bob',
          authorId: 'alice',
        })
      )
    })
  })

  describe('delete rules', () => {
    it('allows author to delete their own post', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore()
        await setDoc(doc(db, 'posts', 'alice-post'), {
          title: 'To Delete',
          authorId: 'alice',
        })
      })

      const alice = testEnv.authenticatedContext('alice')
      const db = alice.firestore()

      await assertSucceeds(deleteDoc(doc(db, 'posts', 'alice-post')))
    })

    it('denies other users from deleting posts', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore()
        await setDoc(doc(db, 'posts', 'alice-post'), {
          title: 'Protected',
          authorId: 'alice',
        })
      })

      const bob = testEnv.authenticatedContext('bob')
      const db = bob.firestore()

      await assertFails(deleteDoc(doc(db, 'posts', 'alice-post')))
    })
  })
})

describe('Users Collection', () => {
  it('allows anyone to read user profiles', async () => {
    const unauthed = testEnv.unauthenticatedContext()
    const db = unauthed.firestore()

    await assertSucceeds(getDoc(doc(db, 'users', 'some-user')))
  })

  it('allows user to write their own profile', async () => {
    const alice = testEnv.authenticatedContext('alice')
    const db = alice.firestore()

    await assertSucceeds(
      setDoc(doc(db, 'users', 'alice'), {
        username: 'alice123',
        displayName: 'Alice',
      })
    )
  })

  it('denies writing to other user profiles', async () => {
    const alice = testEnv.authenticatedContext('alice')
    const db = alice.firestore()

    await assertFails(
      setDoc(doc(db, 'users', 'bob'), {
        username: 'hacked',
        displayName: 'Hacked',
      })
    )
  })
})

describe('Usernames Collection', () => {
  it('allows anyone to check a specific username', async () => {
    const unauthed = testEnv.unauthenticatedContext()
    const db = unauthed.firestore()

    await assertSucceeds(getDoc(doc(db, 'usernames', 'alice')))
  })

  it('allows authenticated user to claim username with their uid', async () => {
    const alice = testEnv.authenticatedContext('alice')
    const db = alice.firestore()

    await assertSucceeds(
      setDoc(doc(db, 'usernames', 'alicename'), {
        uid: 'alice',
        createdAt: new Date(),
      })
    )
  })

  it('denies claiming username with different uid', async () => {
    const alice = testEnv.authenticatedContext('alice')
    const db = alice.firestore()

    await assertFails(
      setDoc(doc(db, 'usernames', 'stolename'), {
        uid: 'bob', // Not alice's uid!
        createdAt: new Date(),
      })
    )
  })

  it('denies updating usernames', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore()
      await setDoc(doc(db, 'usernames', 'existing'), {
        uid: 'alice',
      })
    })

    const alice = testEnv.authenticatedContext('alice')
    const db = alice.firestore()

    await assertFails(
      updateDoc(doc(db, 'usernames', 'existing'), {
        uid: 'bob',
      })
    )
  })

  it('denies deleting usernames', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore()
      await setDoc(doc(db, 'usernames', 'permanent'), {
        uid: 'alice',
      })
    })

    const alice = testEnv.authenticatedContext('alice')
    const db = alice.firestore()

    await assertFails(deleteDoc(doc(db, 'usernames', 'permanent')))
  })
})
