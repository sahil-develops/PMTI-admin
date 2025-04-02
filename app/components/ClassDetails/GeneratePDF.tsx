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

interface PDFData {
  instructor: string;
  location: string;
  startDate: string;
  endDate: string;
  title: string;
  classTime: string;
  days: Array<{
    dayNumber: number;
    date: string;
  }>;
}

// PDF Component
const AttendanceSheetPDF = ({ data, enrollments }: { data: PDFData, enrollments: any[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerText}>Instructor Name: {data.instructor}</Text>
          <Text style={styles.headerText}>Instructor Signature: ____________________</Text>
          <Text style={styles.headerText}>Location: {data.location}</Text>
          <Text style={styles.headerText}>Start Date: {data.startDate}</Text>
          <Text style={styles.headerText}>End Date: {data.endDate}</Text>
        </View>
        <View style={styles.headerRight}>
          <Svg width="160" height="48" viewBox="0 0 160 48">
            <Path d="M0 2h44v44H0z" fill="#4CAF50" />
            <Path d="M26.8992 31.7412L26.8942 18.4473H13.5142L9 22.844H22.38V36.138L26.8992 31.7412Z" fill="white"/>
            <Path d="M34.0399 24.794L34.0348 11.5H20.6548L16.1406 15.8918H29.5206V29.1907L34.0399 24.794Z" fill="white"/>
            <Path d="M14.5247 36.1365C17.5758 36.1365 20.0493 33.7301 20.0493 30.7616C20.0493 27.7931 17.5758 25.3867 14.5247 25.3867C11.4735 25.3867 9 27.7931 9 30.7616C9 33.7301 11.4735 36.1365 14.5247 36.1365Z" fill="white"/>
            <Path d="M68 47.9999V15.9671H73.5502V19.819H73.8766C74.1668 19.2518 74.5788 18.6493 75.1074 18.0065C75.6386 17.3637 76.3537 16.8142 77.258 16.3528C78.1623 15.894 79.3154 15.6621 80.7198 15.6621C82.5698 15.6621 84.2411 16.1209 85.731 17.0335C87.2235 17.9485 88.4076 19.2997 89.286 21.082C90.1644 22.8668 90.6023 25.0524 90.6023 27.6413C90.6023 30.2303 90.1721 32.373 89.3093 34.1628C88.4465 35.9526 87.2727 37.3164 85.7854 38.2567C84.2981 39.197 82.6165 39.6684 80.7353 39.6684C79.3646 39.6684 78.2245 39.4466 77.3202 39.0004C76.4159 38.5542 75.6904 38.0172 75.1463 37.3845C74.5996 36.7518 74.1772 36.1543 73.8766 35.5871H73.6434V47.9923H68V47.9999Z" fill="#1F1F1F"/>
            <Path d="M73.5346 27.6161C73.5346 29.1236 73.7549 30.442 74.1979 31.5739C74.6384 32.7058 75.2784 33.5881 76.1154 34.2208C76.9523 34.8535 77.968 35.1686 79.1625 35.1686C80.357 35.1686 81.453 34.8435 82.2952 34.1905C83.1373 33.5376 83.7747 32.6427 84.2048 31.5058C84.6349 30.3689 84.8526 29.0706 84.8526 27.6161C84.8526 26.1616 84.6401 24.886 84.2126 23.7642C83.7876 22.6424 83.1528 21.7626 82.3107 21.1248C81.4686 20.4871 80.4192 20.1694 79.1625 20.1694C77.9058 20.1694 76.9342 20.477 76.092 21.0946C75.2499 21.7122 74.6125 22.5769 74.1824 23.6886C73.7523 24.8003 73.5346 26.1111 73.5346 27.6161Z" fill="#1F1F1F"/>
            <Path d="M93.9922 39.262V15.9666H99.3869V19.9243H99.6667C100.167 18.5908 100.991 17.5446 102.146 16.7934C103.299 16.0397 104.678 15.6641 106.277 15.6641C107.875 15.6641 109.267 16.0447 110.384 16.8085C111.5 17.5724 112.288 18.611 112.747 19.9243H112.995C113.527 18.6311 114.421 17.5951 115.685 16.8237C116.949 16.0523 118.447 15.6641 120.183 15.6641C122.386 15.6641 124.184 16.3422 125.578 17.6959C126.969 19.0496 127.666 21.0285 127.666 23.625V39.262H122.007V24.4745C122.007 23.0275 121.611 21.9688 120.823 21.2982C120.033 20.6251 119.066 20.2899 117.924 20.2899C116.561 20.2899 115.498 20.7008 114.737 21.5251C113.972 22.3494 113.591 23.4183 113.591 24.7317V39.262H108.057V24.2476C108.057 23.0452 107.686 22.0847 106.943 21.3663C106.199 20.6478 105.23 20.2899 104.035 20.2899C103.224 20.2899 102.486 20.489 101.823 20.8898C101.157 21.2907 100.628 21.8503 100.232 22.5738C99.8351 23.2973 99.6382 24.1392 99.6382 25.0997V39.2645H93.9948L93.9922 39.262Z" fill="#1F1F1F"/>
            <Path d="M143.928 15.9679V20.2156H130.164V15.9679H143.928ZM133.564 10.3867H139.207V32.2578C139.207 32.9965 139.324 33.5586 139.557 33.9493C139.79 34.3376 140.101 34.6048 140.484 34.7459C140.868 34.8871 141.295 34.9577 141.762 34.9577C142.114 34.9577 142.441 34.9325 142.736 34.8821C143.032 34.8317 143.257 34.7863 143.415 34.7459L144.366 39.039C144.065 39.1398 143.635 39.2507 143.081 39.3718C142.524 39.4928 141.847 39.5633 141.047 39.5835C139.632 39.6238 138.36 39.4146 137.227 38.9533C136.095 38.4945 135.199 37.7786 134.538 36.808C133.877 35.8375 133.553 34.6249 133.564 33.1679V10.3867Z" fill="#1F1F1F"/>
            <Path d="M147.223 39.2622V15.9668H152.866V39.2622H147.223Z" fill="#1F1F1F"/>
            <Path d="M156.356 10.3286L156.354 3.54492H149.526L147.223 5.7885H154.05V12.5722L156.356 10.3286Z" fill="#4CAF50"/>
            <Path d="M160.001 6.78368L159.998 0H153.171L150.867 2.24106H157.695V9.02726L160.001 6.78368Z" fill="#4CAF50"/>
            <Path d="M150.042 12.5714C151.599 12.5714 152.861 11.3434 152.861 9.82865C152.861 8.31389 151.599 7.08594 150.042 7.08594C148.485 7.08594 147.223 8.31389 147.223 9.82865C147.223 11.3434 148.485 12.5714 150.042 12.5714Z" fill="#4CAF50"/>
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
            <Text>Email</Text>
          </View>
          {data.days.map((day, index) => (
            <View key={index} style={[styles.tableHeaderCell, { width: '10%' }]}>
              <Text>Day {day.dayNumber}</Text>
              <Text>(10hrs)</Text>
            </View>
          ))}
          <View style={[styles.tableHeaderCell, { width: '10%' }]}>
            <Text>Test Date</Text>
          </View>
          <View style={[styles.tableHeaderCell, { width: '15%', borderRightWidth: 0 }]}>
            <Text>Signature</Text>
          </View>
        </View>

        {/* Table Rows */}
        {enrollments.map((enrollment, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={[styles.tableCell, { width: '20%' }]}>
              <Text>{enrollment.student.name}</Text>
            </View>
            <View style={[styles.tableCell, { width: '15%' }]}>
              <Text>{enrollment.student.email}</Text>
            </View>
            {data.days.map((day, dayIndex) => (
              <View key={dayIndex} style={[styles.tableCell, { width: '10%' }]}>
                <Text>{enrollment[`day${day.dayNumber}Input`] || ''}</Text>
              </View>
            ))}
            <View style={[styles.tableCell, { width: '10%' }]}>
              <Text>{enrollment.testDate || ''}</Text>
            </View>
            <View style={[styles.tableCell, { width: '15%', borderRightWidth: 0 }]}>
              <Text>{enrollment.signatureInput || ''}</Text>
            </View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const GeneratePDF = async (data: PDFData, enrollments: any[]) => {
  const blob = await pdf(<AttendanceSheetPDF data={data} enrollments={enrollments} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.title}-roster.pdf`;
  link.click();
  URL.revokeObjectURL(url);
};

export default GeneratePDF;