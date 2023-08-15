from flask import Flask, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
from PIL import Image
import openai
import os
from gradio_client import Client
from urllib.parse import urlparse
import requests
import shutil
from flask import send_from_directory

app = Flask(__name__)
CORS(app)

openai.api_key = "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"

UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/process_image', methods=['POST'])
def process_image():
    if 'file' not in request.files:
        return {'error': 'No file part'}, 400
    file = request.files['file']

    if file.filename == '':
        return {'error': 'No selected file'}, 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        image = Image.open(file_path).convert("RGBA")
        new_height = image.height + 512+256
        new_image = Image.new("RGBA", (image.width, new_height))
        new_image.paste(image, (0, 0))

        temp_image_path = "temp_image.png"
        new_image.save(temp_image_path, "PNG")

        response = openai.Image.create_edit(
          image=open(temp_image_path, "rb"),
          mask=open(temp_image_path, "rb"),
          prompt="image of a cartoon character pixel art",
          n=1,
          size="256x256"
        )

        os.remove(file_path)
        os.remove(temp_image_path)
        
        image_url = response["data"][0]["url"]
        print(image_url)
        return {'image_url': image_url}

@app.route('/gradio_api_0', methods=['POST'])
def gradio_api_0():
    data = request.get_json()

    if 'imageUrl' not in data:
        return {'error': 'No image URL provided'}, 400

    imageUrl = data['imageUrl']

    # Parse the image URL to get the image name
    image_name = os.path.basename(urlparse(imageUrl).path)

    if not allowed_file(image_name):
        return {'error': 'Invalid file type'}, 400

    try:
        # Download the image
        response = requests.get(imageUrl)

        # Check the response status
        if response.status_code != 200:
            return {'error': 'Failed to download image'}, 400

        # Save the image to a file
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], image_name)
        with open(file_path, 'wb') as f:
            f.write(response.content)

        client = Client("http://34.134.5.228:7860/")
        gradio_result = client.predict(file_path, fn_index=0)

        new_file_paths = []  # New list to store new file paths

        # New code: Move files to uploads folder
        for result_file_path in gradio_result:
            filename = os.path.basename(result_file_path)
            new_file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            shutil.move(result_file_path, new_file_path)
            new_file_paths.append(new_file_path)  # Add new file path to list

        # Transform paths to URLs
        new_file_urls = [f'http://localhost:5000/uploads/{os.path.basename(path)}' for path in new_file_paths]

        return {'gradio_result': new_file_urls}  # Return new file URLs

    except requests.exceptions.RequestException as e:
        return {'error': 'Exception occurred when downloading image'}, 400

@app.route('/gradio_api_1', methods=['POST'])
def gradio_api_1():
    data = request.get_json()

    if 'imageUrl' not in data:
        return {'error': 'No image URL provided'}, 400

    imageUrl = data['imageUrl']

    # Parse the image URL to get the image name
    image_name = os.path.basename(urlparse(imageUrl).path)

    if not allowed_file(image_name):
        return {'error': 'Invalid file type'}, 400

    try:
        # Download the image
        response = requests.get(imageUrl)

        # Check the response status
        if response.status_code != 200:
            return {'error': 'Failed to download image'}, 400

        # Save the image to a file
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], image_name)
        with open(file_path, 'wb') as f:
            f.write(response.content)

        client = Client("http://34.134.5.228:7860/")
        gradio_result = client.predict(file_path, True, fn_index=1)
        
        # New code: Move file to uploads folder
        filename = os.path.basename(gradio_result)
        new_file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        shutil.move(gradio_result, new_file_path)
        
        # Transform path to URL
        new_file_url = f'http://localhost:5000/uploads/{os.path.basename(new_file_path)}'

        os.remove(file_path)
        
        return {'gradio_result': new_file_url}  # Return new file URL

    except requests.exceptions.RequestException as e:
        return {'error': 'Exception occurred when downloading image'}, 400

@app.route('/gradio_api_2', methods=['POST'])
def gradio_api_2():
    data = request.get_json()

    if 'imageUrl' not in data:
        return {'error': 'No image URL provided'}, 400

    imageUrl = data['imageUrl']

    # Parse the image URL to get the image name
    image_name = os.path.basename(urlparse(imageUrl).path)

    if not allowed_file(image_name):
        return {'error': 'Invalid file type'}, 400

    try:
        # Download the image
        response = requests.get(imageUrl)

        # Check the response status
        if response.status_code != 200:
            return {'error': 'Failed to download image'}, 400

        # Save the image to a file
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], image_name)
        with open(file_path, 'wb') as f:
            f.write(response.content)

        client = Client("http://34.134.5.228:7860/")
        gradio_result = client.predict(file_path, True, fn_index=2)

        # New code: Move file to uploads folder
        filename = os.path.basename(gradio_result)
        new_file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        shutil.move(gradio_result, new_file_path)
        
        # Transform path to URL
        new_file_url = f'http://localhost:5000/uploads/{os.path.basename(new_file_path)}'

        os.remove(file_path)
        
        return {'gradio_result': new_file_url}  # Return new file URL
    except requests.exceptions.RequestException as e:
        return {'error': 'Exception occurred when downloading image'}, 400

if __name__ == "__main__":
    app.run(port=5000, debug=True)