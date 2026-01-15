import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest'
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, collection } from 'firebase/firestore'
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

    it('allows admin to delete any post', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore()
        await setDoc(doc(db, 'users', 'admin'), {
          username: 'admin',
          isAdmin: true,
        })
        await setDoc(doc(db, 'posts', 'alice-post'), {
          title: 'Alice Post',
          authorId: 'alice',
        })
      })

      const admin = testEnv.authenticatedContext('admin')
      const db = admin.firestore()

      await assertSucceeds(deleteDoc(doc(db, 'posts', 'alice-post')))
    })

    it('denies unauthenticated users from deleting posts', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore()
        await setDoc(doc(db, 'posts', 'some-post'), {
          title: 'Some Post',
          authorId: 'alice',
        })
      })

      const unauthed = testEnv.unauthenticatedContext()
      const db = unauthed.firestore()

      await assertFails(deleteDoc(doc(db, 'posts', 'some-post')))
    })
  })
})

describe('Users Collection', () => {
  describe('read rules', () => {
    it('allows anyone to read user profiles', async () => {
      const unauthed = testEnv.unauthenticatedContext()
      const db = unauthed.firestore()

      await assertSucceeds(getDoc(doc(db, 'users', 'some-user')))
    })
  })

  describe('create rules', () => {
    it('allows user to create their own profile', async () => {
      const alice = testEnv.authenticatedContext('alice')
      const db = alice.firestore()

      await assertSucceeds(
        setDoc(doc(db, 'users', 'alice'), {
          username: 'alice123',
          displayName: 'Alice',
        })
      )
    })

    it('denies creating other user profiles', async () => {
      const alice = testEnv.authenticatedContext('alice')
      const db = alice.firestore()

      await assertFails(
        setDoc(doc(db, 'users', 'bob'), {
          username: 'hacked',
          displayName: 'Hacked',
        })
      )
    })

    it('denies creating profile with isAdmin field', async () => {
      const alice = testEnv.authenticatedContext('alice')
      const db = alice.firestore()

      await assertFails(
        setDoc(doc(db, 'users', 'alice'), {
          username: 'alice123',
          displayName: 'Alice',
          isAdmin: true,
        })
      )
    })
  })

  describe('update rules', () => {
    it('allows user to update their own profile', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore()
        await setDoc(doc(db, 'users', 'alice'), {
          username: 'alice123',
          displayName: 'Alice',
        })
      })

      const alice = testEnv.authenticatedContext('alice')
      const db = alice.firestore()

      await assertSucceeds(
        updateDoc(doc(db, 'users', 'alice'), {
          displayName: 'Alice Updated',
        })
      )
    })

    it('denies updating other user profiles', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore()
        await setDoc(doc(db, 'users', 'bob'), {
          username: 'bob123',
          displayName: 'Bob',
        })
      })

      const alice = testEnv.authenticatedContext('alice')
      const db = alice.firestore()

      await assertFails(
        updateDoc(doc(db, 'users', 'bob'), {
          displayName: 'Hacked',
        })
      )
    })

    it('denies adding isAdmin field on update', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore()
        await setDoc(doc(db, 'users', 'alice'), {
          username: 'alice123',
          displayName: 'Alice',
        })
      })

      const alice = testEnv.authenticatedContext('alice')
      const db = alice.firestore()

      await assertFails(
        updateDoc(doc(db, 'users', 'alice'), {
          displayName: 'Alice',
          isAdmin: true,
        })
      )
    })

    it('denies changing existing isAdmin field', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore()
        await setDoc(doc(db, 'users', 'alice'), {
          username: 'alice123',
          displayName: 'Alice',
          isAdmin: false,
        })
      })

      const alice = testEnv.authenticatedContext('alice')
      const db = alice.firestore()

      await assertFails(
        updateDoc(doc(db, 'users', 'alice'), {
          isAdmin: true,
        })
      )
    })

    it('allows update when isAdmin stays the same', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore()
        await setDoc(doc(db, 'users', 'alice'), {
          username: 'alice123',
          displayName: 'Alice',
          isAdmin: false,
        })
      })

      const alice = testEnv.authenticatedContext('alice')
      const db = alice.firestore()

      await assertSucceeds(
        updateDoc(doc(db, 'users', 'alice'), {
          displayName: 'Alice Updated',
          isAdmin: false,
        })
      )
    })
  })

  describe('delete rules', () => {
    it('allows user to delete their own profile', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore()
        await setDoc(doc(db, 'users', 'alice'), {
          username: 'alice123',
          displayName: 'Alice',
        })
      })

      const alice = testEnv.authenticatedContext('alice')
      const db = alice.firestore()

      await assertSucceeds(deleteDoc(doc(db, 'users', 'alice')))
    })

    it('denies deleting other user profiles', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore()
        await setDoc(doc(db, 'users', 'bob'), {
          username: 'bob123',
          displayName: 'Bob',
        })
      })

      const alice = testEnv.authenticatedContext('alice')
      const db = alice.firestore()

      await assertFails(deleteDoc(doc(db, 'users', 'bob')))
    })
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

  it('allows owner to delete their username', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore()
      await setDoc(doc(db, 'usernames', 'alicename'), {
        uid: 'alice',
      })
    })

    const alice = testEnv.authenticatedContext('alice')
    const db = alice.firestore()

    await assertSucceeds(deleteDoc(doc(db, 'usernames', 'alicename')))
  })

  it('denies other users from deleting usernames', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore()
      await setDoc(doc(db, 'usernames', 'alicename'), {
        uid: 'alice',
      })
    })

    const bob = testEnv.authenticatedContext('bob')
    const db = bob.firestore()

    await assertFails(deleteDoc(doc(db, 'usernames', 'alicename')))
  })

  it('denies unauthenticated users from deleting usernames', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore()
      await setDoc(doc(db, 'usernames', 'somename'), {
        uid: 'alice',
      })
    })

    const unauthed = testEnv.unauthenticatedContext()
    const db = unauthed.firestore()

    await assertFails(deleteDoc(doc(db, 'usernames', 'somename')))
  })
})
