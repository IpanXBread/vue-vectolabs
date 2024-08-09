<template>
  <div class="assets-container">
    <h1 class="assets-title">Assets</h1>

    <div v-if="assets.length === 0" class="no-assets">
      You have no assets.
      <button @click="openModal('create')" class="new-asset-button">
        <p>New Asset</p>
        <span>+</span>
      </button>
    </div>

    <ul v-else class="assets-list">
      <li v-for="asset in assets" :key="asset.id" class="asset-item">
        <div class="asset-box">
          <div>
            <p class="asset-name">{{ asset.asset }}</p>
            <span class="asset-department">Department - - - - - {{ asset.department }}</span>
          </div>
          <div :style="{ display: 'flex', flexDirection: 'column' }">
            <button @click="openModal('update', asset.id)" class="edit-button">~</button>
            <button @click="openModal('delete', asset.id)" class="delete-button">-</button>
          </div>
        </div>
      </li>
      <div :style="{ display: 'flex', flexDirection: 'row', justifyContent: 'center'}">
        <button @click="openModal('create')" class="new-asset-button" >
          <p>New Asset</p>
          <span>+</span>
        </button>
        <button @click="downloadCSV" class="download-button">Download CSV</button>
      </div>
    </ul>

    <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div v-if="modalType === 'create' || modalType === 'update'" class="modal-form">
          <h2 class="modal-title">{{ assetModalTitle }}</h2>
          <label class="modal-label">
            Name <input v-model="newAsset.name" type="text" class="modal-input" />
          </label>
          <label class="modal-label">
            Department <input v-model="newAsset.department" type="text" class="modal-input" />
          </label>
          <span v-if="assetModalError" class="assetModalError">{{ assetModalError }}</span>
          <button v-if="modalType === 'create'" @click="createAsset" class="modal-submit-button">Create</button>
          <button v-if="modalType === 'update'" @click="updateAsset" class="modal-submit-button">Update</button>
        </div>

        <div v-if="modalType === 'delete'" class="modal-delete">
          <h2 class="modal-delete-title">Are you sure you want to delete asset {{ getCurrentAsset().asset }}?</h2>
          <button @click="confirmDelete" class="modal-delete-button">Confirm Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebaseConfig';

// Reactive array to store assets
const assets = ref([]);

// Modal state
const isModalOpen = ref(false);
const modalType = ref('');
const currentAssetId = ref(null);
const newAsset = ref({ name: '', department: '' });
const assetModalTitle = ref("Create New Asset");
const assetModalError = ref('');

// Open modal function
const openModal = (type, assetId) => {
  modalType.value = type;
  currentAssetId.value = assetId;

  if (type === 'create') {
    assetModalTitle.value = "Create New Asset";
  } else if (type === 'update') {
    assetModalTitle.value = "Update Asset";
    const asset = assets.value.find(asset => asset.id === assetId);
    if (asset) {
      newAsset.value.name = asset.asset;
      newAsset.value.department = asset.department;
    }
  } else if (type === 'delete') {
    assetModalTitle.value = "Delete Asset";
  }

  isModalOpen.value = true;  // Open the modal
};

// Close modal function
const closeModal = () => {
  isModalOpen.value = false;
  newAsset.value = { name: '', department: '' };
};

const getCurrentAsset = () => {
  return assets.value.find(asset => asset.id === currentAssetId.value) || {};
};

// ASSET - CREATE
const createAsset = async () => {

  try {
    if (!newAsset.value.name.trim() || !newAsset.value.department.trim()) {
      console.log("error!");
      assetModalError.value = "You must fill in both form";
    } else {
      const newAssetData = {
      asset: newAsset.value.name,
      department: newAsset.value.department,
    };
      const docRef = await addDoc(collection(db, 'assets'), newAssetData);
      assets.value.push({ id: docRef.id, ...newAssetData });
      closeModal();
    }
    
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

// ASSET - READ
onMounted(async () => {
  const querySnapshot = await getDocs(collection(db, 'assets'));
  querySnapshot.forEach((doc) => {
    const tmpAsset = {
      id: doc.id,
      asset: doc.data().asset,
      department: doc.data().department,
    };
    assets.value.push(tmpAsset);
  });
  // console.log("assets:", assets.value);
});

// ASSET - UPDATE
const updateAsset = async () => {
  try {
    const assetRef = doc(db, 'assets', currentAssetId.value);
    await updateDoc(assetRef, {
      asset: newAsset.value.name,
      department: newAsset.value.department,
    });

    // Update the local assets array
    const updatedAsset = assets.value.find(asset => asset.id === currentAssetId.value);
    if (updatedAsset) {
      updatedAsset.asset = newAsset.value.name;
      updatedAsset.department = newAsset.value.department;
    }

    closeModal();
  } catch (e) {
    console.error("Error updating document: ", e);
  }
};

// ASSET - DELETE
const confirmDelete = async () => {
  try {
    await deleteDoc(doc(db, 'assets', currentAssetId.value));
    assets.value = assets.value.filter(asset => asset.id !== currentAssetId.value);
    closeModal();
  } catch (e) {
    console.error("Error deleting document: ", e);
  }
};

// Convert assets to CSV
const convertToCSV = (data) => {
  const headers = ['id', 'asset', 'department'];
  const csvRows = [];
  csvRows.push(headers.join(','));

  data.forEach(asset => {
    const row = [
      asset.id,
      asset.asset,
      asset.department
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
};

// Download the CSV file
const downloadCSV = () => {
  const csvData = convertToCSV(assets.value);
  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', 'assets.csv');
  a.click();
  window.URL.revokeObjectURL(url);
};

</script>

<style scoped>
/* General styles */
.assets-container {
  font-family: Arial, sans-serif;
  color: #fff;
  padding: 20px;
}

.assets-title {
  font-size: 2em;
  color: #333;
}

button {
  background-color: #fff;
  border: 2px solid #5a5a5a;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #e0e0e0;
}

/* No assets message and buttons */
.no-assets {
  margin: 20px 0;
}

/* Asset list styles */
.assets-list {
  list-style-type: none;
  padding: 0;
}

.asset-item {
  margin-bottom: 15px;
}

.asset-box {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background: linear-gradient(135deg, #450dad, #19789b);
  padding: 15px;
  border-radius: 10px;
  color: #fff;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.asset-box:hover {
  transform: translateY(-3px);
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.2);
}

/* Asset title and department styles */
.asset-name {
  margin: 0;
  font-size: 1.2em;
  font-weight: bold;
}

.asset-department {
  display: block;
  font-size: 0.8em;
}

.edit-button,
.delete-button {
  align-self: flex-end;
  margin-top: 10px;
  border: none;
  color: #333;
  background-color: #fff;
  border-radius: 5px;
  padding: 5px 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.edit-button:hover,
.delete-button:hover {
  background-color: #e0e0e0;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #1d1d1d;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-form,
.modal-delete {
  display: flex;
  flex-direction: column;
}

.modal-title,
.modal-delete-title {
  font-size: 1.5em;
  margin-bottom: 15px;
}

.modal-label {
  margin-bottom: 10px;
}

.modal-input {
  width: 100%;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.modal-submit-button,
.modal-delete-button {
  background-color: #6a0dad;
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 5px;
  margin-top: 15px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.modal-submit-button:hover,
.modal-delete-button:hover {
  background-color: #5a0dac;
}

.new-asset-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #6a0dad;
  color: #fff;
  border: none;
  margin: 10px;
  padding: 10px;
  width: 150px;
}

.new-asset-button p {
  margin-right: 10px;
  font-weight: bold;
}

.new-asset-button span {
  font-size: 1.5em;
}

.download-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #520dad;
  color: #fff;
  border: none;
  margin: 10px;
  padding: 10px;
  width: 150px;
}

.download-button p {
  margin-right: 10px;
  font-weight: bold;
}

.download-button span {
  font-size: 1.5em;
}

.assetModalError {
  color: red;
}
</style>