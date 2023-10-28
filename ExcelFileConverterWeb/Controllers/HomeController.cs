using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace WordWebLanguageTranslaterWeb.Controllers
{
    public class HomeController : Controller
    {
        // GET: Home
        public ActionResult Index()
        {
            

            return View();
        }

        public class ContactRequest
        {
            public string ContactDetail { get; set; }
            public string token { get; set; }
        }
       
        public class LoginRequest
        {
            public string userName { get; set; }
            public string password { get; set; }
        }
        [HttpPost]
        public async Task<string> Login(LoginRequest loginRequest)
        {
            try
            {
                var client = new HttpClient();
                var request = new HttpRequestMessage(HttpMethod.Post, "https://edgelegal.co/LPDM/RT/WS/login");

                // Create a FormData and add the login request parameters
                var formData = new MultipartFormDataContent();
                formData.Add(new StringContent(loginRequest.userName), "userName");
                formData.Add(new StringContent(loginRequest.password), "password");

                // Set the content of the request to the FormData
                request.Content = formData;

                // Send the request
                var response = await client.SendAsync(request);
                response.EnsureSuccessStatusCode();

                if (response.IsSuccessStatusCode)
                {
                    string responseBody = await response.Content.ReadAsStringAsync();
                    return responseBody;
                }
                else
                {
                    string errorResponse = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"HTTP error status code: {response.StatusCode}");
                    return errorResponse;
                }
            }
            catch (Exception ex)
            {
                // Handle any exceptions that occur during the request
                Console.WriteLine($"Error: {ex.Message}");
                return $"Error: {ex.Message}"; // Return the error message as a string
            }
        }


        public class FileUploadRequest
        {
            public Stream FileStream { get; set; }
            public string FileName { get; set; }
            public string ContentDispositionHeader { get; set; }
            public string OriginalName { get; set; }
            public string MatterNumber { get; set; }
        }

        [HttpPost]
        public async Task<string> UploadMatterAttachment(FileUploadRequest fileUploadRequest)
        {
            try
            {
                var client = new HttpClient();
                var request = new HttpRequestMessage(HttpMethod.Post, "https://edgelegal.co/LPDM/RT/WS/uploadMatterAttachment");

                // Create a FormData and add the file and other parameters
                var formData = new MultipartFormDataContent();
                formData.Add(new StreamContent(fileUploadRequest.FileStream), "fileInputStream", fileUploadRequest.FileName);
                formData.Add(new StringContent(fileUploadRequest.ContentDispositionHeader), "contentDispositionHeader");
                formData.Add(new StringContent(fileUploadRequest.OriginalName), "originalName");
                formData.Add(new StringContent(fileUploadRequest.MatterNumber.ToString()), "matterNumber");

                // Set the content of the request to the FormData
                request.Content = formData;

                // Send the request
                var response = await client.SendAsync(request);
                response.EnsureSuccessStatusCode();

                if (response.IsSuccessStatusCode)
                {
                    string responseBody = await response.Content.ReadAsStringAsync();
                    return responseBody;
                }
                else
                {
                    string errorResponse = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"HTTP error status code: {response.StatusCode}");
                    return errorResponse;
                }
            }
            catch (Exception ex)
            {
                // Handle any exceptions that occur during the request
                Console.WriteLine($"Error: {ex.Message}");
                return $"Error: {ex.Message}"; // Return the error message as a string
            }
        }

        //public async Task<string> createContact(ContactRequest contactRequest)
        //{
        //    try
        //    {
        //        var client = new HttpClient();
        //        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.hubapi.com/crm/v3/objects/contacts");
        //        request.Headers.Add("Authorization", "Bearer " + contactRequest.token);
        //        var content = new StringContent(contactRequest.ContactDetail, null, "application/json");
        //        request.Content = content;
        //        var response = await client.SendAsync(request);
        //        response.EnsureSuccessStatusCode();
        //        if (response.IsSuccessStatusCode)
        //        {
        //            string responseBody = await response.Content.ReadAsStringAsync();
        //            return responseBody;
        //        }
        //        else
        //        {
        //            string errorResponse = await response.Content.ReadAsStringAsync();
        //            Console.WriteLine($"HTTP error status code: {response.StatusCode}");
        //            return errorResponse;
        //        }

        //    }
        //    catch (Exception ex)
        //    {
        //        // Handle any exceptions that occur during the request
        //        Console.WriteLine($"Error: {ex.Message}");
        //        return $"Error: {ex.Message}"; // Return the error message as a string
        //    }

        //}

    }
}