package edu.upenn.nets212.hw3;

import java.io.IOException;

import java.util.*;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.*;

public class IterReducer extends Reducer<Text, Text, Text, Text>{
	
	public void reduce(Text key, Iterable<Text> values, Context context) 
			throws IOException, InterruptedException{
		
		HashMap<String, Double> totalmap = new HashMap<>();
		ArrayList<String> datalist = new ArrayList<String>();
		HashMap<String, Double> newmap = new HashMap<>();
		
		String keystring = key.toString();
		if (keystring.charAt(0) == '#'){
			System.out.println("************ IterReducer key: " + key.toString());
			Set<String> test = new HashSet<String>();
			double allsum = 0.0;
			for(Text v: values) {
				test.add("|" + v.toString() + "|");
				String valstring = v.toString();
				double valdouble = Double.parseDouble(valstring);
				allsum += valdouble;
			}
			
			System.out.println("value: " + test.toString());
			String allsumstring = Double.toString(allsum);
			context.write(key, new Text(allsumstring));
		}
		
		
		else {
			System.out.println("************ IterReducer key: " + key.toString());
			Set<String> test = new HashSet<String>();
			
			Text outputval = new Text();
			List<String> weightlist = new ArrayList<String>();
			String neighbors = "undefined";
			String weights = "undefined";
			HashMap<String, Set<Double>> map = new HashMap<>();
			boolean hasweights = false;
			
				for(Text v: values) {
					
					test.add("|" + v.toString() + "|");
					
					String valstring = v.toString();
					
					//if weights
					if (valstring.substring(0,2).equals("!!")) {
						hasweights = true;
						String weightstring = valstring.substring(2);
						String [] weightarray = weightstring.split("%");
						String weightname = weightarray[0];
						double weightdouble = Double.parseDouble(weightarray[2]);
						
						if(map.containsKey(weightname)) {
							Set<Double> valueset = map.get(weightname);
							valueset.add(weightdouble);
						}
						else {
							Set<Double> newvalueset = new HashSet<Double>();
							newvalueset.add(weightdouble);
							map.put(weightname, newvalueset);
						}
					}
					
					//if neighbors
					else {	
						neighbors = valstring;
					}
				}
				
				System.out.println("value: " + test.toString());
				
				System.out.println("map: " + map.toString());
				
				
				//sum ofweights
				//HashMap<String, Double> newmap = new HashMap<>();
				if (hasweights) {
					Set<String> keyset = map.keySet();
					Iterator<String> keyiter = keyset.iterator();
					while (keyiter.hasNext()) {
						String currkey = keyiter.next();
						double weightsum = 0.0;
						Set<Double> valueset2 = map.get(currkey);
						Iterator<Double> valiter = valueset2.iterator();
						while (valiter.hasNext()) {
							double currval = valiter.next();
							weightsum += currval;
							
							//hardcoding
							if(keystring.equals(currkey)) {
								weightsum = 1.0;
								
							}
							
						}
						newmap.put(currkey, weightsum);
					}
					
					Set<String> keyset2 = newmap.keySet();
					Iterator<String> keyiter2 = keyset.iterator();
					
					
					
					
					while (keyiter2.hasNext()) {
						String currkey2 = keyiter2.next();
						String newlabel = currkey2 + "%label!%" + Double.toString(newmap.get(currkey2));
						weightlist.add(newlabel);
					}
					
					
					
					context.write(key, new Text(neighbors + "\t" + weightlist.toString().substring(1, weightlist.toString().length() - 1)));
				}
				
				else {
					context.write(key, new Text(neighbors));
				}
				
				
		}
		
		
			
		
	}
	

}
