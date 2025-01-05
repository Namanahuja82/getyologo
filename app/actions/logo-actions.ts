'use server';

import { v2 as cloudinary } from 'cloudinary';
import { genAI } from '@/utils/gemini';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function generateLogo(prompt: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const enhancedPrompt = `Create a professional logo design for the following business: ${prompt}
    Generate 5 different logo concepts as high-quality JPG images. For each logo, provide ONLY the base64-encoded JPG data with no additional text or explanations.
    Each logo should:
    - Be unique and memorable
    - Use appropriate colors for brand identity
    - Be scalable and work in different sizes
    Please provide each image in this exact format, with five images total:
    `;

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const generatedLogos = await response.text();

    // Debug: Log the raw response
    console.log('Raw Gemini response:', generatedLogos);

    // Split logos using the ### delimiter
    const logoArray = generatedLogos.split('###').map(logo => logo.trim());

    // Debug: Log the split logos
    console.log('Split logos:', logoArray);

    // Filter out any empty strings or invalid images
    const validLogos = logoArray.filter(logo => {
      const cleanLogo = logo.trim();
      return cleanLogo.startsWith('<image>') && cleanLogo.endsWith('</image>');
    });

    if (validLogos.length === 0) {
      throw new Error('No valid JPG logos were generated');
    }

    // Extract base64 data from the <image> tags
    const base64Logos = validLogos.map(logo => logo.slice(7, -8));

    // Process and store valid logos in Cloudinary
    const logoUrls = await Promise.all(
      base64Logos.map(async (base64Data, index) => {
        try {
          const result = await cloudinary.uploader.upload(
            `data:image/jpeg;base64,${base64Data}`,
            {
              folder: 'logos',
              public_id: `logo-${Date.now()}-${index}`,
              resource_type: 'image',
              format: 'jpg',
              allowed_formats: ['jpg'],
              transformation: [{ quality: 'auto' }],
            }
          );

          return {
            url: result.secure_url,
            id: result.public_id,
          };
        } catch (uploadError) {
          console.error(`Error uploading logo ${index}:`, uploadError);
          return null;
        }
      })
    );

    // Filter out any failed uploads
    const successfulUploads = logoUrls.filter(url => url !== null);

    if (successfulUploads.length === 0) {
      throw new Error('Failed to upload any logos to Cloudinary');
    }

    return { logos: successfulUploads };
  } catch (error) {
    console.error('Error generating logos:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate logos: ${error.message}`);
    }
    throw new Error('Failed to generate logos: Unknown error');
  }
}
