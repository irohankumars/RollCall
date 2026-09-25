import {useLocalSearchParams} from 'expo-router';
import {TimetableEntryEditor} from '@/timetable/management';
export default function EditTimetableEntry(){const{scheduleId}=useLocalSearchParams<{scheduleId:string}>();return <TimetableEntryEditor manager="hod" id={scheduleId}/>;}
