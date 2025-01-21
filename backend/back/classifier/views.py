from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from PIL import Image
import numpy as np
import tensorflow as tf
import os

class ClassifyImageView(APIView):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        model_path = os.path.join(os.path.dirname(__file__), 'brain_tumor_classifier.h5')
        try:
            self.model = tf.keras.models.load_model(model_path)
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = None
        self.class_labels = ['Glioma Tumor', 'Meningioma Tumor', 'No Tumor', 'Pituitary Tumor']

    def post(self, request):
        try:
            image_file = request.FILES.get('image')
            if not image_file:
                return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

            image = Image.open(image_file) #image_file is an object file and not a path of image
            image = image.resize((150, 150))

            img_array = np.array(image)
            img_array = img_array.reshape(1, 150, 150, 3)

            # Predict
            predictions = self.model.predict(img_array)
            
            # Get the predicted class index (highest probability class)
            predicted_class_index = np.argmax(predictions[0])

            # Get the confidence (probability of the predicted class)
            confidence = predictions[0][predicted_class_index]
            print(f"Confidence: {confidence}")

            # Get the class label from the predicted index
            predicted_class = self.class_labels[predicted_class_index]

            # Return the result
            return Response({
                'result': predicted_class,
                'confidence': f"{confidence:.2%}"  # Display confidence as a percentage
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error in processing: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
