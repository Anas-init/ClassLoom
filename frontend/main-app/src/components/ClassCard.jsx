import React from 'react';
import { Card, CardContent, Typography, CardMedia, /* Box */ } from '@mui/material';

const ClassCard = ({ bannerUrl, className, section, instructor }) => {
	return (
		<Card className="max-w-sm bg-gray-800 shadow-lg m-4 rounded-md">
			<CardMedia
				component="img"
				height="140"
				image={bannerUrl}
				alt={`${className} banner`}
			/>
			<CardContent>
				<Typography variant="h6" className="text-white">
					{className}
				</Typography>
				<Typography variant="subtitle1" className="text-gray-400">
					{section}
				</Typography>
				<Typography variant="body2" className="text-gray-500">
					Instructor: {instructor}
				</Typography>
			</CardContent>
		</Card>
	);
};

export default ClassCard;
