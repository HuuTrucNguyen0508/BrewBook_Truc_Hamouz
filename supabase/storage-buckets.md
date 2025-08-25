# Supabase Storage Buckets

## Recipe Media Bucket

Create a bucket named `recipe-media` in your Supabase project:

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `recipe-media`
3. Set it as public (for now - you can make it private later with signed URLs)
4. Configure CORS if needed for your domain

## Optional: Cloudinary Integration

For advanced image transformations and share cards, you can also integrate Cloudinary:

1. Set up Cloudinary account
2. Configure environment variables:
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_UPLOAD_PRESET`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## File Upload Flow

1. User selects image/video in recipe form
2. File is uploaded to Supabase storage or Cloudinary
3. URL is stored in recipe record
4. Images are displayed in recipe cards and detail views
