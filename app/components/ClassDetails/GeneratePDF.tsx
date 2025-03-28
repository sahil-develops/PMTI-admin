import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Svg, Path } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 0,
    paddingBottom: 5,
  },
  headerInfo: {
    flexDirection: 'column',
  },
  headerText: {
    marginBottom: 3,
  },
  headerRight: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    width: 160,

  },
  table: {
    display: 'flex',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableHeaderCell: {
    borderRightWidth: 1,
    borderRightColor: '#000',
    padding: 5,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#f0f0f0',
  },
  tableCell: {
    borderRightWidth: 1,
    borderRightColor: '#000',
    padding: 5,
    textAlign: 'center',
  },
  lastCell: {
    borderRightWidth: 0,
  },
});

// PDF Component
interface AttendanceSheetPDFProps {
  classDetails: ClassDetails;
  enrollment: {
    student: { name: string };
    EnrollmentDate: string;
  };
}

const AttendanceSheetPDF: React.FC<AttendanceSheetPDFProps> = ({ classDetails, enrollment }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerText}>Instructor Name: {classDetails.instructor}</Text>
          <Text style={styles.headerText}>Instructor Signature: ____________________</Text>
          <Text style={styles.headerText}>Location: {classDetails.location}</Text>
          <Text style={styles.headerText}>Start Date: {formatDate(classDetails.startDate)}</Text>
          <Text style={styles.headerText}>End Date: {formatDate(classDetails.endDate)}</Text>
        </View>
        <View style={styles.headerRight}>
        <Svg width={160} height={49} viewBox="0 0 160 49">
            <Path d="M0 2.5h44v44H0z" fill="#4CAF50"/>
            <Path d="M26.8992 32.2412l-.005-13.294H13.5142L9 23.344h13.38v13.294l4.5192-4.3968z" fill="#fff"/>
            <Path d="M34.0413 25.294l-.005-13.294H20.6563l-4.5142 4.3918h13.38v13.299l4.5192-4.3968z" fill="#fff"/>
            <Path d="M14.5247 36.6365c3.0511 0 5.5246-2.4064 5.5246-5.375 0-2.9685-2.4735-5.375-5.5247-5.375-3.0511 0-5.5246 2.4065-5.5246 5.375 0 2.9686 2.4735 5.375 5.5247 5.375z" fill="#fff"/>
                     </Svg>
        </View>
      </View>

      {/* Attendance Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <View style={[styles.tableHeaderCell, { width: '20%' }]}>
            <Text>Student Name</Text>
          </View>
          <View style={[styles.tableHeaderCell, { width: '15%' }]}>
            <Text>Enrolled Date</Text>
          </View>
          <View style={[styles.tableHeaderCell, { width: '15%' }]}>
            <Text>Signature</Text>
          </View>
          <View style={[styles.tableHeaderCell, { width: '10%' }]}>
            <Text>Day 1</Text>
          </View>
          <View style={[styles.tableHeaderCell, { width: '10%' }]}>
            <Text>Day 2</Text>
          </View>
          <View style={[styles.tableHeaderCell, { width: '10%' }]}>
            <Text>Day 3</Text>
          </View>
          <View style={[styles.tableHeaderCell, { width: '10%' }]}>
            <Text>Day 4</Text>
          </View>
          <View style={[styles.tableHeaderCell, { width: '10%', borderRightWidth: 0 }]}>
            <Text>PMP Test Date</Text>
          </View>
        </View>

        {/* Table Rows */}
        {Array.from({ length: 15 }).map((_, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={[styles.tableCell, { width: '20%' }]}>
              {index === 0 ? <Text>{enrollment.student.name}</Text> : <Text></Text>}
            </View>
            <View style={[styles.tableCell, { width: '15%' }]}>
              {index === 0 ? <Text>{formatDate(enrollment.EnrollmentDate)}</Text> : <Text></Text>}
            </View>
            <View style={[styles.tableCell, { width: '15%' }]}></View>
            <View style={[styles.tableCell, { width: '10%' }]}></View>
            <View style={[styles.tableCell, { width: '10%' }]}></View>
            <View style={[styles.tableCell, { width: '10%' }]}></View>
            <View style={[styles.tableCell, { width: '10%' }]}></View>
            <View style={[styles.tableCell, { width: '10%', borderRightWidth: 0 }]}></View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

// Function to format date
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Invalid date format:', dateString);
    return dateString;
  }
};

// Function to generate and trigger PDF download
interface ClassDetails {
  title: string;
  instructor: string;
  location: string;
  startDate: string;
  endDate: string;
}

const generatePDF = (classDetails: ClassDetails, enrollment: { student: { name: string }; EnrollmentDate: string }) => {
  const doc = pdf(<AttendanceSheetPDF classDetails={classDetails} enrollment={enrollment} />);
  doc.toBlob().then((blob) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${classDetails.title.toLowerCase().replace(/\s+/g, '-')}-attendance-sheet.pdf`;
    link.click();
  });
};

export default generatePDF;