import ClassIcon from '@mui/icons-material/Class';
import { stringToMuiColor } from '../components/stringToMuiColor';

export default async function fetchNavigation() {
    try {
        // const response = await axios.post("http://127.0.0.1:8000/api/classes/");
        const response = [
            { class_id: 1, class_name: 'Mathematics 101', creator: 'Dr. Alice' },
            { class_id: 2, class_name: 'Physics 202', creator: 'Prof. Bob' },
            { class_id: 3, class_name: 'History 303', creator: 'Dr. Carol' },
        ];
        return response.map((classItem) => ({
            title: classItem.class_name,
            segment: `${classItem.class_id}`,
            icon: <ClassIcon sx={{ color: stringToMuiColor(classItem.class_name) + " !important" }} />,
        }));
    } catch (error) {
        console.error('Failed to fetch navigation data:', error);
        return [];
    }
}
