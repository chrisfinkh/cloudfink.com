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
    it('allows anyone to read published posts', async () => {
      // Setup: create a published post
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore()
        await setDoc(doc(db, 'posts', 'published-post'), {
          title: 'Published',
          authorId: 'alice',
          status: 'published',
        })
      })

      const unauthed = testEnv.unauthenticatedContext()
      const db = unauthed.firestore()

      await assertSucceeds(getDoc(doc(db, 'posts', 'published-post')))
    })

    it('denies unauthenticated users from reading pending posts', async () => {
      // Setup: create a pending post
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore()
        await setDoc(doc(db, 'posts', 'pending-post'), {
          title: 'Pending',
          authorId: 'alice',
          status: 'pending',
        })
      })

      const unauthed = testEnv.unauthenticatedContext()
      const db = unauthed.firestore()

      await assertFails(getDoc(doc(db, 'posts', 'pending-post')))
    })

    it('allows author to read their own pending post', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore()
        await setDoc(doc(db, 'posts', 'pending-post'), {
          title: 'Pending',
          authorId: 'alice',
          status: 'pending',
        })
      })

      const alice = testEnv.authenticatedContext('alice')
      const db = alice.firestore()

      await assertSucceeds(getDoc(doc(db, 'posts', 'pending-post')))
    })

    it('denies other users from reading pending posts', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore()
        await setDoc(doc(db, 'posts', 'pending-post'), {
          title: 'Pending',
          authorId: 'alice',
          status: 'pending',
        })
      })

      const bob = testEnv.authenticatedContext('bob')
      const db = bob.firestore()

      await assertFails(getDoc(doc(db, 'posts', 'pending-post')))
    })

    it('allows admin to read pending posts', async () => {
      // Setup: create admin user and pending post
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore()
        await setDoc(doc(db, 'users', 'admin'), {
          username: 'admin',
          isAdmin: true,
        })
        await setDoc(doc(db, 'posts', 'pending-post'), {
          title: 'Pending',
          authorId: 'alice',
          status: 'pending',
        })
      })

      const admin = testEnv.authenticatedContext('admin')
      const db = admin.firestore()

      await assertSucceeds(getDoc(doc(db, 'posts', 'pending-post')))
    })
  })

  describe('create rules', () => {
    it('allows authenticated user to create post with pending status', async () => {
      const alice = testEnv.authenticatedContext('alice')
      const db = alice.firestore()

      await assertSucceeds(
        setDoc(doc(db, 'posts', 'new-post'), {
          title: 'Test Post',
          body: 'Content',
          authorId: 'alice',
          status: 'pending',
        })
      )
    })

    it('denies creating post with published status', async () => {
      const alice = testEnv.authenticatedContext('alice')
      const db = alice.firestore()

      await assertFails(
        setDoc(doc(db, 'posts', 'new-post'), {
          title: 'Test Post',
          body: 'Content',
          authorId: 'alice',
          status: 'published', // Cannot create as published!
        })
      )
    })

    it('denies creating post without status', async () => {
      const alice = testEnv.authenticatedContext('alice')
      const db = alice.firestore()

      await assertFails(
        setDoc(doc(db, 'posts', 'new-post'), {
          title: 'Test Post',
          body: 'Content',
          authorId: 'alice',
          // Missing status field!
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
          status: 'pending',
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
          status: 'pending',
        })
      )
    })
  })

  describe('update rules', () => {
    it('allows author to update their own post (keeping status)', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore()
        await setDoc(doc(db, 'posts', 'alice-post'), {
          title: 'Original',
          body: 'Content',
          authorId: 'alice',
          status: 'pending',
        })
      })

      const alice = testEnv.authenticatedContext('alice')
      const db = alice.firestore()

      await assertSucceeds(
        updateDoc(doc(db, 'posts', 'alice-post'), {
          title: 'Updated Title',
          authorId: 'alice',
          status: 'pending', // Must keep same status
        })
      )
    })

    it('denies author from changing status to published', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore()
        await setDoc(doc(db, 'posts', 'alice-post'), {
          title: 'Original',
          body: 'Content',
          authorId: 'alice',
          status: 'pending',
        })
      })

      const alice = testEnv.authenticatedContext('alice')
      const db = alice.firestore()

      await assertFails(
        updateDoc(doc(db, 'posts', 'alice-post'), {
          title: 'Updated Title',
          authorId: 'alice',
          status: 'published', // Cannot self-publish!
        })
      )
    })

    it('allows admin to publish a pending post', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore()
        await setDoc(doc(db, 'users', 'admin'), {
          username: 'admin',
          isAdmin: true,
        })
        await setDoc(doc(db, 'posts', 'pending-post'), {
          title: 'Pending Post',
          body: 'Content',
          authorId: 'alice',
          status: 'pending',
        })
      })

      const admin = testEnv.authenticatedContext('admin')
      const db = admin.firestore()

      await assertSucceeds(
        updateDoc(doc(db, 'posts', 'pending-post'), {
          status: 'published',
        })
      )
    })

    it('allows admin to update any post', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore()
        await setDoc(doc(db, 'users', 'admin'), {
          username: 'admin',
          isAdmin: true,
        })
        await setDoc(doc(db, 'posts', 'alice-post'), {
          title: 'Alice Post',
          body: 'Content',
          authorId: 'alice',
          status: 'published',
        })
      })

      const admin = testEnv.authenticatedContext('admin')
      const db = admin.firestore()

      await assertSucceeds(
        updateDoc(doc(db, 'posts', 'alice-post'), {
          title: 'Admin Edited',
        })
      )
    })

    it('denies changing authorId (Arc-style attack)', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore()
        await setDoc(doc(db, 'posts', 'alice-post'), {
          title: 'Alice Post',
          body: 'Content',
          authorId: 'alice',
          status: 'pending',
        })
      })

      const alice = testEnv.authenticatedContext('alice')
      const db = alice.firestore()

      await assertFails(
        updateDoc(doc(db, 'posts', 'alice-post'), {
          title: 'Hacked',
          authorId: 'bob', // Trying to change ownership!
          status: 'pending',
        })
      )
    })

    it('denies other users from updating posts', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore()
        await setDoc(doc(db, 'posts', 'alice-post'), {
          title: 'Alice Post',
          body: 'Content',
          authorId: 'alice',
          status: 'pending',
        })
      })

      const bob = testEnv.authenticatedContext('bob')
      const db = bob.firestore()

      await assertFails(
        updateDoc(doc(db, 'posts', 'alice-post'), {
          title: 'Hacked by Bob',
          authorId: 'alice',
          status: 'pending',
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
