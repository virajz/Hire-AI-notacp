import nltk
import os
import shutil
import zipfile # For manual unzipping
import ssl

# --- NLTK SSL Hotfix (if needed, often for local environments or specific Python versions) ---
# Some environments might have SSL certificate verification issues when NLTK tries to download.
# This attempts to use the default system SSL certificates if available.
# If you don't face SSL errors during download, you might not strictly need this part.
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass # Python version doesn't have/need it
else:
    ssl._create_default_https_context = _create_unverified_https_context
# --- End NLTK SSL Hotfix ---

# Define a path within your project where NLTK data will be stored.
# This path will be relative to your project root.
# On Render, this will typically become /opt/render/project/src/nltk_data_local
project_root = os.getcwd() # Assumes script is run from project root
nltk_data_storage_path = os.path.join(project_root, "nltk_data_local")

def download_resources():
    print(f"NLTK data storage path set to: {nltk_data_storage_path}")
    if not os.path.exists(nltk_data_storage_path):
        os.makedirs(nltk_data_storage_path, exist_ok=True)
        print(f"Created NLTK data directory: {nltk_data_storage_path}")

    resources_to_download = [
        "stopwords", "punkt", "averaged_perceptron_tagger",
        "wordnet", "maxent_ne_chunker", "words"
    ]

    for resource_id in resources_to_download:
        try:
            expected_category_dir = ""
            expected_item_name_in_unzipped_dir = ""

            if resource_id == "stopwords":
                expected_category_dir = os.path.join(nltk_data_storage_path, "corpora")
                expected_item_name_in_unzipped_dir = "english" # A file inside the unzipped stopwords dir
            elif resource_id == "punkt":
                expected_category_dir = os.path.join(nltk_data_storage_path, "tokenizers")
                expected_item_name_in_unzipped_dir = os.path.join("punkt", "PY3", "english.pickle")
            elif resource_id == "averaged_perceptron_tagger":
                expected_category_dir = os.path.join(nltk_data_storage_path, "taggers")
                expected_item_name_in_unzipped_dir = os.path.join("averaged_perceptron_tagger", "averaged_perceptron_tagger.pickle")
            elif resource_id == "wordnet":
                expected_category_dir = os.path.join(nltk_data_storage_path, "corpora")
                expected_item_name_in_unzipped_dir = os.path.join("wordnet", "lexnames")
            elif resource_id == "maxent_ne_chunker":
                expected_category_dir = os.path.join(nltk_data_storage_path, "chunkers")
                expected_item_name_in_unzipped_dir = os.path.join("maxent_ne_chunker", "PY3","english_ace_multiclass.pickle")
            elif resource_id == "words":
                expected_category_dir = os.path.join(nltk_data_storage_path, "corpora")
                expected_item_name_in_unzipped_dir = os.path.join("words", "en")
            
            # Path to the directory where the unzipped resource should reside
            unzipped_resource_path = os.path.join(expected_category_dir, resource_id if resource_id not in expected_item_name_in_unzipped_dir else os.path.dirname(expected_item_name_in_unzipped_dir))
            # Path to a specific file/folder within the unzipped resource to check for existence
            verification_item_path = os.path.join(expected_category_dir, expected_item_name_in_unzipped_dir)

            if os.path.exists(verification_item_path):
                print(f"NLTK resource '{resource_id}' (verified by {verification_item_path}) already found. Skipping download.")
                continue
            
            print(f"Downloading NLTK resource: {resource_id} to {nltk_data_storage_path}...")
            nltk.download(resource_id, download_dir=nltk_data_storage_path, quiet=False, raise_on_error=True)
            print(f"Successfully called nltk.download for {resource_id}.")

            # For zipped resources (like stopwords, wordnet, etc.), ensure they are unzipped and the zip is removed.
            zip_file_path = os.path.join(expected_category_dir, f"{resource_id}.zip")
            if os.path.exists(zip_file_path):
                print(f"Found {zip_file_path}. Ensuring it is unzipped to {unzipped_resource_path}.")
                if not os.path.exists(unzipped_resource_path):
                    os.makedirs(unzipped_resource_path, exist_ok=True)
                
                with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
                    zip_ref.extractall(unzipped_resource_path)
                print(f"Unzipped {resource_id} to {unzipped_resource_path}.")
                
                print(f"Removing {zip_file_path} after unzipping...")
                os.remove(zip_file_path)
                print(f"Removed {zip_file_path}.")
            else:
                print(f"No .zip file found for {resource_id} at {zip_file_path} (this is normal if nltk.download unzips and removes it).")

            # Final verification
            if os.path.exists(verification_item_path):
                print(f"NLTK resource '{resource_id}' is now available (verified by {verification_item_path}).")
            else:
                print(f"VERIFICATION FAILED for '{resource_id}': Expected item {verification_item_path} still not found after download/unzip attempt.")
                if os.path.exists(unzipped_resource_path):
                    print(f"Contents of {unzipped_resource_path}: {os.listdir(unzipped_resource_path)}")
                else:
                    print(f"{unzipped_resource_path} does not exist.")
        except Exception as e:
            print(f"Error processing NLTK resource '{resource_id}': {str(e)}")
            if resource_id == "stopwords": # Example of failing build for critical resource
                print("Critical resource 'stopwords' failed. Exiting build script with error.")
                exit(1)

if __name__ == "__main__":
    download_resources()
    print(f"NLTK resource download process complete. Data should be in: {nltk_data_storage_path}")
    if os.path.exists(nltk_data_storage_path):
        print(f"Contents of {nltk_data_storage_path} (top-level): {os.listdir(nltk_data_storage_path)}")
        corpora_path = os.path.join(nltk_data_storage_path, 'corpora')
        if os.path.exists(corpora_path):
            print(f"Contents of {corpora_path}: {os.listdir(corpora_path)}")
            stopwords_path = os.path.join(corpora_path, 'stopwords')
            if os.path.exists(stopwords_path):
                print(f"Contents of {stopwords_path}: {os.listdir(stopwords_path)}")

    if nltk_data_storage_path not in nltk.data.path:
        nltk.data.path.append(nltk_data_storage_path)
    print(f"NLTK search paths (during build script execution): {nltk.data.path}")
