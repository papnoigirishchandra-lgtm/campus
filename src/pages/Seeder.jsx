import { useState } from 'react';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const Seeder = () => {
  const [status, setStatus] = useState('Ready to seed database.');
  const [loading, setLoading] = useState(false);

  const seedData = async () => {
    setLoading(true);
    setStatus('Starting seed process...');
    try {
      // 0. Create Custom Admin
      setStatus('Creating Custom Admin account...');
      let customAdminUid;
      try {
        const customAdminCred = await createUserWithEmailAndPassword(auth, 'arjunaharshit@gmail.com', 'A234567890');
        customAdminUid = customAdminCred.user.uid;
      } catch (e) {
        if (e.code === 'auth/email-already-in-use') setStatus('Custom Admin already exists, skipping...');
        else throw e;
      }
      if (customAdminUid) {
        await setDoc(doc(db, 'users', customAdminUid), {
          name: 'Arjuna Harshit',
          email: 'arjunaharshit@gmail.com',
          role: 'admin',
          avatarUrl: '',
          createdAt: serverTimestamp()
        });
      }

      // 1. Create Admin
      setStatus('Creating Admin account...');
      let adminUid;
      try {
        const adminCred = await createUserWithEmailAndPassword(auth, 'admin@campus.com', 'password123');
        adminUid = adminCred.user.uid;
      } catch (e) {
        if (e.code === 'auth/email-already-in-use') setStatus('Admin already exists, skipping...');
        else throw e;
      }
      if (adminUid) {
        await setDoc(doc(db, 'users', adminUid), {
          name: 'System Admin',
          email: 'admin@campus.com',
          role: 'admin',
          avatarUrl: '',
          createdAt: serverTimestamp()
        });
      }

      // 2. Create Teacher
      setStatus('Creating Teacher account...');
      let teacherUid;
      try {
        const teacherCred = await createUserWithEmailAndPassword(auth, 'teacher@campus.com', 'password123');
        teacherUid = teacherCred.user.uid;
      } catch (e) {
        if (e.code === 'auth/email-already-in-use') setStatus('Teacher already exists, skipping...');
        else throw e;
      }
      if (teacherUid) {
        await setDoc(doc(db, 'users', teacherUid), {
          name: 'Prof. Alice',
          email: 'teacher@campus.com',
          role: 'teacher',
          avatarUrl: '',
          createdAt: serverTimestamp()
        });
      }

      // 3. Create Student
      setStatus('Creating Student account...');
      let studentUid;
      try {
        const studentCred = await createUserWithEmailAndPassword(auth, 'student@campus.com', 'password123');
        studentUid = studentCred.user.uid;
      } catch (e) {
        if (e.code === 'auth/email-already-in-use') setStatus('Student already exists, skipping...');
        else throw e;
      }
      if (studentUid) {
        await setDoc(doc(db, 'users', studentUid), {
          name: 'John Student',
          email: 'student@campus.com',
          role: 'student',
          avatarUrl: '',
          createdAt: serverTimestamp()
        });
      }

      // 4. Create Mock Course (if teacher exists)
      if (teacherUid) {
        setStatus('Creating mock courses and assignments...');
        const courseRef = await addDoc(collection(db, 'courses'), {
          courseName: 'Introduction to Computer Science',
          courseCode: 'CS101',
          teacherId: teacherUid,
          students: studentUid ? [studentUid] : [],
          createdAt: serverTimestamp()
        });

        // 5. Create Mock Assignment
        await addDoc(collection(db, 'assignments'), {
          title: 'First Python Script',
          description: 'Write a python script that prints "Hello World".',
          dueDate: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
          courseId: courseRef.id,
          teacherId: teacherUid,
          createdAt: serverTimestamp()
        });

        // 6. Add Mock Announcement
        await addDoc(collection(db, 'announcements'), {
          title: 'Welcome to CS101',
          type: 'Notice',
          courseId: courseRef.id,
          createdAt: serverTimestamp()
        });
        
        // 7. Add mock Activity
        await addDoc(collection(db, 'activityFeed'), {
          type: 'courseCreated',
          message: 'CS101 course was initialized.',
          createdAt: serverTimestamp()
        });
      }

      await signOut(auth);
      setStatus('Database seeded successfully! You can now log in.');

    } catch (error) {
      console.error(error);
      setStatus('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Database Seeder</h1>
        <p className="text-slate-600 mb-8">This will create test accounts and initial data for courses and assignments.</p>
        
        <button 
          onClick={seedData} 
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Seeding...' : 'Seed Database'}
        </button>

        <p className="mt-6 text-sm font-mono text-slate-500">{status}</p>

        <div className="mt-8 text-left text-xs text-slate-500 bg-slate-50 p-4 rounded-lg">
          <p className="font-bold">Accounts that will be created:</p>
          <ul className="list-disc pl-4 mt-2">
            <li>admin@campus.com (password123)</li>
            <li>teacher@campus.com (password123)</li>
            <li>student@campus.com (password123)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Seeder;
