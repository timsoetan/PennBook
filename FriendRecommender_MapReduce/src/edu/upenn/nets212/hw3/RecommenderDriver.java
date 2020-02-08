package edu.upenn.nets212.hw3;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FileStatus;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.*;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.input.TextInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.mapreduce.lib.output.TextOutputFormat;


public class RecommenderDriver 
{
  public static void main(String[] args) throws Exception 
  {
	  
	  //inializie directories
	  
	  int numReducers;
	  String inputDir;
	  String initDir;
	  String initDir2;
	  String outputDir;
	  String intermDir1;
	  String intermDir2; 
	  String intermDir3; 
	  String diffDir;
	  String tempDir1;
	  String tempDir2;
	  
	  
	  //composite arg
	  if (args[0].equals("composite")) {
		  
		 
		  
		  inputDir = args[1];
		  initDir = args[2];
		  initDir2 = args[3];
		  intermDir1 = args[4];
		  intermDir2 = args[5]; 
		  tempDir1 = args[6];
		  tempDir2 = args[7];
		  diffDir = args[8];
		  outputDir = args[9];
		  numReducers = Integer.parseInt(args[10]);
		  
		  composite(inputDir,initDir, initDir2,
				  intermDir1,intermDir2,tempDir1, tempDir2,
				  diffDir, outputDir, numReducers);
	  }
	  
	//inita arg
	  else if (args[0].equals("init1")) {
		  
		  inputDir = args[1];
		  intermDir1 = args[2];
		  numReducers = Integer.parseInt(args[3]);
		  
		  init1(inputDir, intermDir1, numReducers);
		  
	  }
	  
	  //init arg
	  else if (args[0].equals("init2")) {
		  
		  inputDir = args[1];
		  intermDir1 = args[2];
		  numReducers = Integer.parseInt(args[3]);
		  
		  init2(inputDir, intermDir1, numReducers);
		  
	  }
	  
	//init2 arg
	  else if (args[0].equals("init3")) {
		  
		  inputDir = args[1];
		  intermDir1 = args[2];
		  numReducers = Integer.parseInt(args[3]);
		  
		  init3(inputDir, intermDir1, numReducers);
		  
	  }
	  
	  //iter arg
	  else if (args[0].equals("iter")) {
		  
		  inputDir = args[1];
		  intermDir1 = args[2];
		  numReducers = Integer.parseInt(args[3]);
		  
		  iter(inputDir, intermDir1, numReducers);
	  }
	  
	//norm arg
	  else if (args[0].equals("norm")) {
		  
		  inputDir = args[1];
		  intermDir2 = args[2];
		  numReducers = Integer.parseInt(args[3]);
		  
		  norm(inputDir, intermDir2, numReducers);
	  }
	  
	  //diff arg
	  else if (args[0].equals("diff")) {
		  
		  intermDir1 = args[1];
		  intermDir2 = args[2];
		  diffDir = args[3];
		  numReducers = 1;
		  
		  diff(intermDir1, intermDir2, diffDir, numReducers);
	  }
	  
	  
	  
	  //finish arg
	  else if (args[0].equals("finish")) {
		  
		  intermDir2 = args[1];
		  outputDir = args[2];
		  numReducers = Integer.parseInt(args[3]);
		  
		  finish(intermDir2, outputDir, numReducers);
	  }
  }
  
  /**
   * composite function that runs entire process
   * @param inputDir
   * @param outputDir
   * @param intermDir1
   * @param intermDir2
   * @param diffDir
   * @param numReducers
   * @throws Exception
   */
  public static void composite(String inputDir, String initDir, String initDir2,
		  String intermDir1, String intermDir2,String tempDir1, String tempDir2,String diffDir,
		  String outputDir, int numReducers) throws Exception {
	  
	 
	  
	  
	  //init, iter, and diff once
	  init1(inputDir, tempDir1, numReducers);
	  init2(tempDir1, initDir, numReducers);
	  init3(initDir, initDir2, numReducers);
	  iter(initDir2, intermDir1, numReducers);
	  
	  
	  //read difference
	  Double difference = 5.0;
	 
	  boolean bool = true;
	 int counter = 0;
	  
	  //repeat iter and diff while difference is greater than 0.01
	  while(difference >= 0.01 && counter < 20) {
		  
		//alternate between itering from intermDir1 to intermDir2 and vice versa
		  if (bool) {
			  iter(intermDir1, tempDir1, numReducers);
			  iter(tempDir1, tempDir2, numReducers);
			  norm(tempDir2, intermDir2, numReducers);
			  bool = !bool;
		  }
		  else if (!bool){
			  iter(intermDir2, tempDir2, numReducers);
			  iter(tempDir2, tempDir1, numReducers);
			  norm(tempDir1, intermDir1, numReducers);
			  bool = !bool;
		  }  
		  
	
		 if (counter % 2 == 0) {
			  diff(intermDir1, intermDir2, diffDir, 1);
			  difference = readDiffResult(diffDir);
			  
		 }
		 counter++;
		  
		 
	  }
	  
	  //finish
	  if (!bool) {
		  finish(intermDir2, outputDir, numReducers);
	  }
	  else {
		  finish(intermDir1, outputDir, numReducers);
	  }
	  
	  
  }
  
  /**
   * init function
   * @param input
   * @param output
   * @param numReducers
   * @throws Exception
   */
  public static void init2(String input, String output, int numReducers) throws Exception {
	  
	  deleteDirectory(output);
	  
	  @SuppressWarnings("deprecation")
      Job initJob = new Job();
	  initJob.setJarByClass(RecommenderDriver.class);
	  initJob.setJobName("Init2 Job");
	  
	  //set input and output paths
	  FileInputFormat.addInputPath(initJob, new Path(input));    
	  FileOutputFormat.setOutputPath(initJob, new Path(output));
	  
	  //set mapper and reducer classes
	  initJob.setMapperClass(InitMapper2.class);
	  initJob.setReducerClass(InitReducer2.class);
	    
	  //set mapper output classes
	  initJob.setMapOutputKeyClass(Text.class);
	  initJob.setMapOutputValueClass(Text.class);

	  //set reducer output classes
	  initJob.setOutputKeyClass(Text.class);
	  initJob.setOutputValueClass(Text.class);
	    
	  initJob.setInputFormatClass(TextInputFormat.class);
	  initJob.setOutputFormatClass(TextOutputFormat.class);
	  
	  initJob.setNumReduceTasks(numReducers);
	  
	  initJob.waitForCompletion(true);
	  
  }
  
public static void init1(String input, String output, int numReducers) throws Exception {
	  
	  deleteDirectory(output);
	  
	  @SuppressWarnings("deprecation")
      Job initJob = new Job();
	  initJob.setJarByClass(RecommenderDriver.class);
	  initJob.setJobName("Init1 Job");
	  
	  //set input and output paths
	  FileInputFormat.addInputPath(initJob, new Path(input));    
	  FileOutputFormat.setOutputPath(initJob, new Path(output));
	  
	  //set mapper and reducer classes
	  initJob.setMapperClass(InitMapper1.class);
	  initJob.setReducerClass(InitReducer1.class);
	    
	  //set mapper output classes
	  initJob.setMapOutputKeyClass(Text.class);
	  initJob.setMapOutputValueClass(Text.class);

	  //set reducer output classes
	  initJob.setOutputKeyClass(Text.class);
	  initJob.setOutputValueClass(Text.class);
	    
	  initJob.setInputFormatClass(TextInputFormat.class);
	  initJob.setOutputFormatClass(TextOutputFormat.class);
	  
	  initJob.setNumReduceTasks(numReducers);
	  
	  initJob.waitForCompletion(true);
	  
  }
  
  
 public static void init3(String input, String output, int numReducers) throws Exception {
	  
	  deleteDirectory(output);
	  
	  @SuppressWarnings("deprecation")
      Job initJob = new Job();
	  initJob.setJarByClass(RecommenderDriver.class);
	  initJob.setJobName("Init3 Job");
	  
	  //set input and output paths
	  FileInputFormat.addInputPath(initJob, new Path(input));    
	  FileOutputFormat.setOutputPath(initJob, new Path(output));
	  
	  //set mapper and reducer classes
	  initJob.setMapperClass(InitMapper3.class);
	  initJob.setReducerClass(InitReducer3.class);
	    
	  //set mapper output classes
	  initJob.setMapOutputKeyClass(Text.class);
	  initJob.setMapOutputValueClass(Text.class);

	  //set reducer output classes
	  initJob.setOutputKeyClass(Text.class);
	  initJob.setOutputValueClass(Text.class);
	    
	  initJob.setInputFormatClass(TextInputFormat.class);
	  initJob.setOutputFormatClass(TextOutputFormat.class);
	  
	  initJob.setNumReduceTasks(numReducers);
	  
	  initJob.waitForCompletion(true);
	  
  }
  
  /**
   * iter function
   * @param input
   * @param output
   * @param numReducers
   * @throws Exception
   */
  public static void iter(String input, String output, int numReducers) throws Exception {
	  
	  deleteDirectory(output);
	  
	  Job iterJob = new Job();
	  iterJob.setJarByClass(RecommenderDriver.class);
	  iterJob.setJobName("Iter Job");
	  
	  //set input and output paths
	  FileInputFormat.addInputPath(iterJob, new Path(input));    
	  FileOutputFormat.setOutputPath(iterJob, new Path(output));
	  
	  //set mapper and reducer classes
	  iterJob.setMapperClass(IterMapper.class);
	  iterJob.setReducerClass(IterReducer.class);
	    
	  //set mapper output classes
	  iterJob.setMapOutputKeyClass(Text.class);
	  iterJob.setMapOutputValueClass(Text.class);

	  //set reducer output classes
	  iterJob.setOutputKeyClass(Text.class);
	  iterJob.setOutputValueClass(Text.class);
	    
	  iterJob.setInputFormatClass(TextInputFormat.class);
	  iterJob.setOutputFormatClass(TextOutputFormat.class);
	  
	  iterJob.setNumReduceTasks(numReducers);
	  
	  iterJob.waitForCompletion(true);
  }
  
  
  /**
   * iter function
   * @param input
   * @param output
   * @param numReducers
   * @throws Exception
   */
  public static void norm(String input, String output, int numReducers) throws Exception {
	  
	  deleteDirectory(output);
	  
	  Job iterJob = new Job();
	  iterJob.setJarByClass(RecommenderDriver.class);
	  iterJob.setJobName("Norm Job");
	  
	  //set input and output paths
	  FileInputFormat.addInputPath(iterJob, new Path(input));    
	  FileOutputFormat.setOutputPath(iterJob, new Path(output));
	  
	  //set mapper and reducer classes
	  iterJob.setMapperClass(NormalizeMapper.class);
	  iterJob.setReducerClass(NormalizeReducer.class);
	    
	  //set mapper output classes
	  iterJob.setMapOutputKeyClass(Text.class);
	  iterJob.setMapOutputValueClass(Text.class);

	  //set reducer output classes
	  iterJob.setOutputKeyClass(Text.class);
	  iterJob.setOutputValueClass(Text.class);
	    
	  iterJob.setInputFormatClass(TextInputFormat.class);
	  iterJob.setOutputFormatClass(TextOutputFormat.class);
	  
	  iterJob.setNumReduceTasks(numReducers);
	  
	  iterJob.waitForCompletion(true);
  }
  
  /**
   * diff function
   * @param input1
   * @param input2
   * @param output
   * @param numReducers
   * @throws Exception
   */
  public static void diff(String input1, String input2, String output, int numReducers) 
		  throws Exception {
	  
	  deleteDirectory("rg_hi_klsdj");
	  
	  
	  
	  //job to take differences of the weights
	  Job diffJob1 = new Job();
	  diffJob1.setJarByClass(RecommenderDriver.class);
	  diffJob1.setJobName("Diff1 Job");
	  
	  //set input and output paths
	  FileInputFormat.addInputPath(diffJob1, new Path(input1));
	  FileInputFormat.addInputPath(diffJob1, new Path(input2));  
	  //FileOutputFormat.setOutputPath(diffJob1, new Path(output));
	  FileOutputFormat.setOutputPath(diffJob1, new Path("rg_hi_klsdj"));
	  
	  //set mapper and reducer classes
	  diffJob1.setMapperClass(DiffMapper1.class);
	  diffJob1.setReducerClass(DiffReducer1.class);
	    
	  //set mapper output classes
	  diffJob1.setMapOutputKeyClass(Text.class);
	  diffJob1.setMapOutputValueClass(Text.class);

	  //set reducer output classes
	  diffJob1.setOutputKeyClass(Text.class);
	  diffJob1.setOutputValueClass(Text.class);
	    
	  diffJob1.setInputFormatClass(TextInputFormat.class);
	  diffJob1.setOutputFormatClass(TextOutputFormat.class);
	  
	  diffJob1.setNumReduceTasks(1);
	  diffJob1.waitForCompletion(true);	
	  
	  deleteDirectory(output);
	  
	  //job to take the maximum difference
	  Job diffJob2 = new Job();
	  diffJob2.setJarByClass(RecommenderDriver.class);
	  diffJob2.setJobName("Diff2 Job");
	  
	  //set input and output paths
	  FileInputFormat.addInputPath(diffJob2, new Path("rg_hi_klsdj"));    
	  FileOutputFormat.setOutputPath(diffJob2, new Path(output));
	  
	  //set mapper and reducer classes
	  diffJob2.setMapperClass(DiffMapper2.class);
	  diffJob2.setReducerClass(DiffReducer2.class);
	    
	  //set mapper output classes
	  diffJob2.setMapOutputKeyClass(Text.class);
	  diffJob2.setMapOutputValueClass(DoubleWritable.class);

	  //set reducer output classes
	  diffJob2.setOutputKeyClass(Text.class);
	  diffJob2.setOutputValueClass(Text.class);
	    
	  diffJob2.setInputFormatClass(TextInputFormat.class);
	  diffJob2.setOutputFormatClass(TextOutputFormat.class);
	  
	  diffJob2.setNumReduceTasks(1);
	  
	  diffJob2.waitForCompletion(true);
	  
	  
  }
  
  /**
   * finish function
   * @param input
   * @param output
   * @param numReducers
   * @throws Exception
   */
  public static void finish(String input, String output, int numReducers) throws Exception {
	  
	  deleteDirectory(output);
	  
	  Job finJob = new Job();
	  finJob.setJarByClass(RecommenderDriver.class);
	  finJob.setJobName("Finish Job");
	  
	  //set input and output paths
	  FileInputFormat.addInputPath(finJob, new Path(input));    
	  FileOutputFormat.setOutputPath(finJob, new Path(output));
	  
	  //set mapper and reducer classes
	  finJob.setMapperClass(FinishMapper.class);
	  finJob.setReducerClass(FinishReducer.class);
	    
	  //set mapper output classes
	  finJob.setMapOutputKeyClass(Text.class);
	  finJob.setMapOutputValueClass(Text.class);

	  //set reducer output classes
	  finJob.setOutputKeyClass(Text.class);
	  finJob.setOutputValueClass(Text.class);
	    
	  finJob.setInputFormatClass(TextInputFormat.class);
	  finJob.setOutputFormatClass(TextOutputFormat.class);
	  
	  finJob.setNumReduceTasks(numReducers);
	  
	  System.exit(finJob.waitForCompletion(true) ? 0 : 1);
  }
  

  // Given an output folder, returns the first double from the first part-r-00000 file
  static double readDiffResult(String path) throws Exception 
  {
    double diffnum = 0.0;
    Path diffpath = new Path(path);
    Configuration conf = new Configuration();
    FileSystem fs = FileSystem.get(URI.create(path),conf);
    
    if (fs.exists(diffpath)) {
      FileStatus[] ls = fs.listStatus(diffpath);
      for (FileStatus file : ls) {
	if (file.getPath().getName().startsWith("part-r-00000")) {
	  FSDataInputStream diffin = fs.open(file.getPath());
	  BufferedReader d = new BufferedReader(new InputStreamReader(diffin));
	  String diffcontent = d.readLine();
	  System.out.println("*********" + diffcontent);
	  diffnum = Double.parseDouble(diffcontent);
	  d.close();
	}
      }
    }
    
    fs.close();
    return diffnum;
  }

  static void deleteDirectory(String path) throws Exception {
    Path todelete = new Path(path);
    Configuration conf = new Configuration();
    FileSystem fs = FileSystem.get(URI.create(path),conf);
    
    if (fs.exists(todelete)) 
      fs.delete(todelete, true);
      
    fs.close();
  }

}

