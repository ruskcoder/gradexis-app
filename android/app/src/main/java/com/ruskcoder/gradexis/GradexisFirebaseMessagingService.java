package com.ruskcoder.gradexis;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class GradexisFirebaseMessagingService extends FirebaseMessagingService {
    private static final String TAG = "GradexisFirebaseMSG";
    private static final String CHANNEL_ID = "gradexis-channel";
    private ExecutorService executor = Executors.newSingleThreadExecutor();

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        
        System.out.println(TAG + " From: " + remoteMessage.getFrom());
        System.out.println(TAG + " Message data payload: " + remoteMessage.getData());

        // Check if message contains a data payload with grade_check trigger
        if (remoteMessage.getData().size() > 0) {
            String trigger = remoteMessage.getData().get("trigger");
            System.out.println(TAG + " Trigger found: " + trigger);
            if ("grade_check".equals(trigger)) {
                System.out.println(TAG + " Received grade check trigger, starting background grade check");
                executor.execute(this::performGradeCheck);
                return;
            }
        }

        // Handle regular notification messages
        if (remoteMessage.getNotification() != null) {
            System.out.println(TAG + " Message Notification Body: " + remoteMessage.getNotification().getBody());
            sendNotification(remoteMessage.getNotification().getTitle(), 
                           remoteMessage.getNotification().getBody());
        }
    }

    private void performGradeCheck() {
        try {
            System.out.println(TAG + " Starting background grade check for all users");
            
            // Get stored user data from SharedPreferences
            SharedPreferences prefs = getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            String usersJson = prefs.getString("users", "[]");
            
            System.out.println(TAG + " Users JSON: " + usersJson.substring(0, Math.min(500, usersJson.length())) + "...");
            
            JSONArray users = new JSONArray(usersJson);
            
            if (users.length() == 0) {
                System.out.println(TAG + " No users found, skipping grade check");
                return;
            }
            
            System.out.println(TAG + " Found " + users.length() + " users to check");
            
            // Check grades for all users
            boolean anyChanges = false;
            for (int userIndex = 0; userIndex < users.length(); userIndex++) {
                try {
                    JSONObject user = users.getJSONObject(userIndex);
                    String username = user.optString("username", "unknown");
                    System.out.println(TAG + " Checking grades for user " + (userIndex + 1) + "/" + users.length() + ": " + username);
                    
                    // Fetch current grades for this user
                    JSONObject currentGrades = fetchGrades(user);
                    if (currentGrades == null) {
                        System.out.println(TAG + " Failed to fetch current grades for user: " + username);
                        continue; // Skip this user and continue with next
                    }
                    
                    // Compare with stored grades and show notification if changed
                    boolean hasChanges = compareAndUpdateGrades(user, currentGrades, users, userIndex, prefs, username);
                    if (hasChanges) {
                        System.out.println(TAG + " Grade changes detected for user: " + username);
                        anyChanges = true;
                    } else {
                        System.out.println(TAG + " No grade changes detected for user: " + username);
                    }
                    
                    // Small delay between users to avoid overwhelming the server
                    Thread.sleep(1000); // 1 second delay between users
                    
                } catch (Exception e) {
                    System.out.println(TAG + " Error checking grades for user " + userIndex + ": " + e.getMessage());
                    e.printStackTrace();
                    // Continue with next user even if this one fails
                }
            }
            
            if (anyChanges) {
                System.out.println(TAG + " Grade changes detected for one or more users");
            } else {
                System.out.println(TAG + " No grade changes detected for any users");
            }
            
        } catch (Exception e) {
            System.out.println(TAG + " Error performing grade check: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private JSONObject fetchGrades(JSONObject user) {
        try {
            String platform = user.optString("platform", "hac");
            
            // Try to get API URL from SharedPreferences, fallback to default
            SharedPreferences prefs = getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            String apiUrl = prefs.getString("apiUrl", "https://api.gradexis.com/");
            
            // Remove quotes if stored as JSON string
            if (apiUrl.startsWith("\"") && apiUrl.endsWith("\"")) {
                apiUrl = apiUrl.substring(1, apiUrl.length() - 1);
            }
            
            System.out.println(TAG + " Using API URL: " + apiUrl);
            System.out.println(TAG + " Using platform: " + platform);
            
            // Build query parameters
            StringBuilder queryParams = new StringBuilder();
            addParam(queryParams, "link", user.optString("link", ""));
            addParam(queryParams, "clsession", user.optString("clsession", ""));
            addParam(queryParams, "username", user.optString("username", ""));
            addParam(queryParams, "password", user.optString("password", ""));
            addParam(queryParams, "term", "");
            addParam(queryParams, "stream", "");
            
            // Remove trailing &
            if (queryParams.length() > 0) {
                queryParams.setLength(queryParams.length() - 1);
            }
            
            String urlString = apiUrl + "/" + platform + "/classes?" + queryParams.toString();
            System.out.println(TAG + " Fetching grades from: " + urlString);
            
            URL url = new URL(urlString);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(30000); // 30 seconds connect timeout
            connection.setReadTimeout(180000);   // 3 minutes read timeout for slow responses
            
            int responseCode = connection.getResponseCode();
            System.out.println(TAG + " HTTP response code: " + responseCode);
            
            if (responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();
                
                String responseStr = response.toString();
                System.out.println(TAG + " API response length: " + responseStr.length());
                System.out.println(TAG + " API response preview: " + responseStr.substring(0, Math.min(300, responseStr.length())) + "...");
                
                JSONObject result = new JSONObject(responseStr);
                System.out.println(TAG + " Successfully parsed JSON response");
                return result;
            } else {
                BufferedReader errorReader = new BufferedReader(new InputStreamReader(connection.getErrorStream()));
                StringBuilder errorResponse = new StringBuilder();
                String line;
                while ((line = errorReader.readLine()) != null) {
                    errorResponse.append(line);
                }
                errorReader.close();
                System.out.println(TAG + " HTTP error " + responseCode + ": " + errorResponse.toString());
            }
            
        } catch (Exception e) {
            System.out.println(TAG + " Error fetching grades: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }
    
    private void addParam(StringBuilder queryParams, String key, String value) {
        if (value != null && !value.isEmpty()) {
            try {
                if (queryParams.length() > 0) {
                    queryParams.append("&");
                }
                queryParams.append(URLEncoder.encode(key, "UTF-8"))
                          .append("=")
                          .append(URLEncoder.encode(value, "UTF-8"));
                } catch (Exception e) {
                System.out.println(TAG + " Error encoding parameter " + key + ": " + e.getMessage());
            }
        }
    }    private boolean compareAndUpdateGrades(JSONObject user, JSONObject currentGrades, JSONArray users, int userIndex, SharedPreferences prefs, String username) {
        try {
            JSONObject gradelist = user.optJSONObject("gradelist");
            if (gradelist == null) {
                gradelist = new JSONObject();
                user.put("gradelist", gradelist);
            }
            
            String term = currentGrades.optString("term", "current");
            JSONObject termGrades = gradelist.optJSONObject(term);
            if (termGrades == null) {
                termGrades = new JSONObject();
                gradelist.put(term, termGrades);
            }
            
            boolean hasChanges = false;
            JSONArray changes = new JSONArray();
            JSONArray currentClasses = currentGrades.optJSONArray("classes");
            
            if (currentClasses != null) {
                for (int i = 0; i < currentClasses.length(); i++) {
                    JSONObject currentClass = currentClasses.getJSONObject(i);
                    String className = currentClass.optString("name", "");
                    double currentAverage = currentClass.optDouble("average", 0.0);
                    
                    JSONObject storedClass = termGrades.optJSONObject(className);
                    if (storedClass == null) {
                        // New class - store but don't notify on first time
                        JSONObject newClass = new JSONObject();
                        newClass.put("average", currentAverage);
                        newClass.put("lastUpdated", System.currentTimeMillis());
                        termGrades.put(className, newClass);
                        System.out.println(TAG + " New class stored: " + className);
                        continue;
                    }
                    
                    double storedAverage = storedClass.optDouble("average", 0.0);
                    
                    // Check if grade changed by more than 0.01%
                    if (Math.abs(currentAverage - storedAverage) > 0.01) {
                        hasChanges = true;
                        
                        JSONObject change = new JSONObject();
                        change.put("className", className);
                        change.put("oldAverage", storedAverage);
                        change.put("newAverage", currentAverage);
                        change.put("improvement", currentAverage > storedAverage);
                        changes.put(change);
                        
                        // Update stored grade
                        storedClass.put("average", currentAverage);
                        storedClass.put("lastUpdated", System.currentTimeMillis());
                        
                        System.out.println(TAG + " Grade change: " + className + " " + storedAverage + "% -> " + currentAverage + "%");
                    }
                }
            }
            
            // Save updated user data back to SharedPreferences
            users.put(userIndex, user);
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("users", users.toString());
            editor.apply();
            
            // Show notification if there are changes
            if (hasChanges) {
                showGradeChangeNotification(changes, username);
            }
            
            return hasChanges;
            
        } catch (Exception e) {
            System.out.println(TAG + " Error comparing grades: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    private void showGradeChangeNotification(JSONArray changes, String username) {
        try {
            String title = "Grade Change";
            String body;
            
            // Add username prefix if there are multiple users
            SharedPreferences prefs = getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            String usersJson = prefs.getString("users", "[]");
            JSONArray users = new JSONArray(usersJson);
            String userPrefix = users.length() > 1 ? username + ": " : "";
            
            if (changes.length() == 1) {
                JSONObject change = changes.getJSONObject(0);
                String className = change.optString("className", "Class");
                double oldAverage = change.optDouble("oldAverage", 0.0);
                double newAverage = change.optDouble("newAverage", 0.0);
                
                body = String.format("%sYour grade for %s has changed from %.1f%% to %.1f%%", 
                                   userPrefix, className, oldAverage, newAverage);
            } else {
                int improvements = 0;
                for (int i = 0; i < changes.length(); i++) {
                    if (changes.getJSONObject(i).optBoolean("improvement", false)) {
                        improvements++;
                    }
                }
                int decreases = changes.length() - improvements;
                
                if (changes.length() == 2) {
                    JSONObject change1 = changes.getJSONObject(0);
                    JSONObject change2 = changes.getJSONObject(1);
                    body = String.format("%sGrades changed for %s and %s", 
                                       userPrefix,
                                       change1.optString("className", "Class"),
                                       change2.optString("className", "Class"));
                } else {
                    body = String.format("%s%d grades have changed", userPrefix, changes.length());
                    if (improvements > 0 && decreases > 0) {
                        body += String.format(" (%d improved, %d decreased)", improvements, decreases);
                    } else if (improvements > 0) {
                        body += String.format(" (%d improved)", improvements);
                    } else {
                        body += String.format(" (%d decreased)", decreases);
                    }
                }
            }
            
            sendNotification(title, body);
            
        } catch (Exception e) {
            System.out.println(TAG + " Error showing grade change notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void sendNotification(String title, String body) {
        System.out.println(TAG + " Sending notification: " + title + " - " + body);
        
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, intent,
                PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder notificationBuilder =
                new NotificationCompat.Builder(this, CHANNEL_ID)
                        .setSmallIcon(R.mipmap.ic_launcher)
                        .setContentTitle(title != null ? title : "Gradexis")
                        .setContentText(body != null ? body : "Grade update")
                        .setAutoCancel(true)
                        .setContentIntent(pendingIntent);

        NotificationManager notificationManager =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

        // Create notification channel for Android O and above
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Gradexis Notifications",
                    NotificationManager.IMPORTANCE_DEFAULT);
            notificationManager.createNotificationChannel(channel);
        }

        notificationManager.notify(0, notificationBuilder.build());
    }

    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);
        System.out.println(TAG + " Refreshed token: " + token);
        // You can send the token to your server here if needed
    }
}
