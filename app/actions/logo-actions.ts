'use server';

import { createClient } from '@supabase/supabase-js';
import { genAI } from '@/utils/gemini';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // Replace with your actual Supabase project URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey || !supabaseUrl) {
  throw new Error("Supabase environment variables are not properly set.");
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export async function generateLogo(prompt: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const enhancedPrompt = `Create a professional logo design for the following business: ${prompt}
    Please generate 10 different logo concepts with the following specifications:
    - Each logo should be unique and memorable
    - Consider color psychology and brand identity
    - Include a mix of minimal and detailed designs
    - Ensure the designs are scalable
    Please return the results in SVG format.`;

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const generatedLogos = response.text();

    // Process and store logos in Supabase
    const logoUrls = await Promise.all(
      Array(10)
        .fill(null)
        .map(async (_, index) => {
          const logoData = `Generated logo data ${index + 1}`; // Replace with actual logo SVG data

          // Upload logo to Supabase storage
          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('logos')
            .upload(
              `logo-${Date.now()}-${index}.svg`,
              logoData,
              {
                contentType: 'image/svg+xml',
                cacheControl: '3600',
              }
            );

          if (uploadError) {
            console.error('Error uploading logo:', uploadError);
            throw uploadError;
          }

          // Generate a signed URL for the uploaded file
          const { data: signedUrlData, error: signedUrlError } = await supabase
            .storage
            .from('logos')
            .createSignedUrl(uploadData.path, 60 * 60); // URL valid for 1 hour

          if (signedUrlError) {
            console.error('Error creating signed URL:', signedUrlError);
            throw signedUrlError;
          }

          return {
            url: signedUrlData.signedUrl,
            id: uploadData.path,
          };
        })
    );

    return { logos: logoUrls };
  } catch (error) {
    console.error('Error generating logos:', error);
    throw new Error('Failed to generate logos');
  }
}
