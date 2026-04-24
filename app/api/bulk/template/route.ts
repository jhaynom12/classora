import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'students', 'teachers', 'parents'

  try {
    let csvContent = '';

    if (type === 'students') {
      csvContent = `full_name,email,student_id,password,class_name,parent_email,date_of_birth
Adeola Kamara,adeola.kamara@student.school,STU001,Student@123,SS2 Science,parent.adeola@email.com,2006-05-15
Bola Taiwo,bola.taiwo@student.school,STU002,Student@124,SS2 Science,parent.bola@email.com,2006-08-22
Chidi Okafor,chidi.okafor@student.school,STU003,Student@125,SS2 Science,parent.chidi@email.com,2006-03-10
"Instructions: 
- full_name: Student's full name (required)
- email: Student's email address (required, must be unique)
- student_id: Student ID number (required, must be unique)
- password: Temporary login password (required)
- class_name: Class name (e.g., SS2 Science) (required)
- parent_email: Parent email address (required)
- date_of_birth: Date of birth in YYYY-MM-DD format (optional)"`;
    } else if (type === 'teachers') {
      csvContent = `full_name,email,staff_id,password,subject,phone,date_of_birth
Mrs. Adebayo,adebayo@teacher.school,TCH001,Teacher@123,Mathematics,+234 802 345 6789,1975-06-20
Mr. Johnson,johnson@teacher.school,TCH002,Teacher@124,English,+234 803 456 7890,1978-09-15
Dr. Okonkwo,okonkwo@teacher.school,TCH003,Teacher@125,Physics,+234 804 567 8901,1972-12-03
"Instructions:
- full_name: Teacher's full name (required)
- email: Teacher's email address (required, must be unique)
- staff_id: Staff ID number (required, must be unique)
- password: Temporary login password (required)
- subject: Subject taught (optional)
- phone: Phone number (optional)
- date_of_birth: Date of birth in YYYY-MM-DD format (optional)"`;
    } else if (type === 'parents') {
      csvContent = `full_name,email,phone,password,child_student_id,occupation
Mr. Kamal Kamara,parent.adeola@email.com,+234 802 345 6789,Parent@123,STU001,Engineer
Mrs. Taiwo Bola,parent.bola@email.com,+234 803 456 7890,Parent@124,STU002,Doctor
Mr. Okafor Chidi,parent.chidi@email.com,+234 804 567 8901,Parent@125,STU003,Teacher
"Instructions:
- full_name: Parent's full name (required)
- email: Parent's email address (required, must be unique)
- phone: Phone number (required)
- password: Temporary login password (required)
- child_student_id: Student ID of child (required)
- occupation: Parent's occupation (optional)"`;
    } else {
      return NextResponse.json({ error: 'Invalid template type' }, { status: 400 });
    }

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="classora_${type}_template.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 });
  }
}
